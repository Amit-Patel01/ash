import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/app_models.dart';

class SolutionHubRepository {
  SolutionHubRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  Stream<AppUser?> watchUserProfile(User firebaseUser) {
    return _firestore
        .collection('users')
        .doc(firebaseUser.uid)
        .snapshots()
        .map(
          (snapshot) => AppUser.fromMap(
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fallbackName: firebaseUser.displayName,
            data: snapshot.data(),
          ),
        );
  }

  Future<void> updateUserProfile(String uid, Map<String, dynamic> updates) {
    return _firestore.collection('users').doc(uid).set({
      ...updates,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> saveDeviceToken({
    required String uid,
    required String token,
  }) {
    return _firestore.collection('users').doc(uid).set({
      'fcmTokens': FieldValue.arrayUnion([token]),
      'lastTokenAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Stream<List<AppNotificationItem>> watchNotifications(AppUser user) {
    return _firestore.collection('notifications').snapshots().map((snapshot) {
      final items = snapshot.docs
          .map((entry) => AppNotificationItem.fromMap(entry.id, entry.data()))
          .where((item) => _notificationMatchesUser(item, user))
          .toList()
        ..sort(_sortByDateDescending);
      return items.take(50).toList();
    });
  }

  Future<void> markNotificationRead(String id) {
    return _firestore.collection('notifications').doc(id).set({
      'read': true,
      'readAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> markAllNotificationsRead(List<String> ids) async {
    if (ids.isEmpty) return;
    final batch = _firestore.batch();
    for (final id in ids) {
      final ref = _firestore.collection('notifications').doc(id);
      batch.set(
        ref,
        {
          'read': true,
          'readAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    }
    await batch.commit();
  }

  Stream<List<CourseItem>> watchCoursesForUser(AppUser user) {
    final controller = StreamController<List<CourseItem>>();
    List<CourseItem> genericCourses = const [];
    List<CourseItem> tradingCourses = const [];
    List<EnrollmentItem> genericEnrollments = const [];
    List<EnrollmentItem> tradingEnrollments = const [];

    void emit() {
      final courses = _visibleCourses(
        user,
        [...genericCourses, ...tradingCourses],
        [...genericEnrollments, ...tradingEnrollments],
      );
      controller.add(courses);
    }

    final subscriptions = <StreamSubscription<dynamic>>[
      _firestore.collection('courses').snapshots().listen((snapshot) {
        genericCourses = snapshot.docs
            .map((doc) => CourseItem.fromGenericMap(doc.id, doc.data()))
            .toList();
        emit();
      }),
      _firestore.collection('tradingCourses').snapshots().listen((snapshot) {
        tradingCourses = snapshot.docs
            .map((doc) => CourseItem.fromTradingMap(doc.id, doc.data()))
            .toList();
        emit();
      }),
      _firestore.collection('enrollments').snapshots().listen((snapshot) {
        genericEnrollments = snapshot.docs
            .map(
              (doc) => EnrollmentItem.fromMap(
                doc.id,
                doc.data(),
                kind: 'Course',
              ),
            )
            .toList();
        emit();
      }),
      _firestore.collection('tradingEnrollments').snapshots().listen((snapshot) {
        tradingEnrollments = snapshot.docs
            .map(
              (doc) => EnrollmentItem.fromMap(
                doc.id,
                doc.data(),
                kind: 'Trading',
              ),
            )
            .toList();
        emit();
      }),
    ];

    controller.onCancel = () async {
      for (final subscription in subscriptions) {
        await subscription.cancel();
      }
    };

    return controller.stream;
  }

  Stream<HomeDashboardData> watchDashboard(AppUser user) {
    final controller = StreamController<HomeDashboardData>();
    List<CourseItem> genericCourses = const [];
    List<CourseItem> tradingCourses = const [];
    List<EnrollmentItem> genericEnrollments = const [];
    List<EnrollmentItem> tradingEnrollments = const [];
    List<TaskItem> tasks = const [];
    List<CertificateItem> certificates = const [];
    List<AppNotificationItem> notifications = const [];
    AnnouncementItem announcement = AnnouncementItem.disabled();

    void emit() {
      final allCourses = [...genericCourses, ...tradingCourses];
      final allEnrollments = [...genericEnrollments, ...tradingEnrollments];
      final visibleCourses = _visibleCourses(user, allCourses, allEnrollments);
      final visibleEnrollments =
          _visibleEnrollments(user, visibleCourses, allEnrollments);
      final visibleTasks = _visibleTasks(user, tasks);
      final visibleCertificates = _visibleCertificates(user, certificates);

      controller.add(
        HomeDashboardData(
          courses: _attachStudentCounts(visibleCourses, visibleEnrollments),
          enrollments: visibleEnrollments,
          tasks: visibleTasks,
          notifications: notifications,
          certificates: visibleCertificates,
          announcement: announcement,
        ),
      );
    }

    final subscriptions = <StreamSubscription<dynamic>>[
      _firestore.collection('courses').snapshots().listen((snapshot) {
        genericCourses = snapshot.docs
            .map((doc) => CourseItem.fromGenericMap(doc.id, doc.data()))
            .toList();
        emit();
      }),
      _firestore.collection('tradingCourses').snapshots().listen((snapshot) {
        tradingCourses = snapshot.docs
            .map((doc) => CourseItem.fromTradingMap(doc.id, doc.data()))
            .toList();
        emit();
      }),
      _firestore.collection('enrollments').snapshots().listen((snapshot) {
        genericEnrollments = snapshot.docs
            .map(
              (doc) => EnrollmentItem.fromMap(
                doc.id,
                doc.data(),
                kind: 'Course',
              ),
            )
            .toList();
        emit();
      }),
      _firestore.collection('tradingEnrollments').snapshots().listen((snapshot) {
        tradingEnrollments = snapshot.docs
            .map(
              (doc) => EnrollmentItem.fromMap(
                doc.id,
                doc.data(),
                kind: 'Trading',
              ),
            )
            .toList();
        emit();
      }),
      _firestore.collection('tasks').snapshots().listen((snapshot) {
        tasks =
            snapshot.docs.map((doc) => TaskItem.fromMap(doc.id, doc.data())).toList()
              ..sort(_sortByDateDescending);
        emit();
      }),
      _firestore.collection('certificates').snapshots().listen((snapshot) {
        certificates = snapshot.docs
            .map((doc) => CertificateItem.fromMap(doc.id, doc.data()))
            .toList()
          ..sort(_sortByDateDescending);
        emit();
      }),
      _firestore
          .collection('settings')
          .doc('announcement')
          .snapshots()
          .listen((snapshot) {
        announcement = AnnouncementItem.fromMap(snapshot.data());
        emit();
      }),
      watchNotifications(user).listen((items) {
        notifications = items;
        emit();
      }),
    ];

    controller.onCancel = () async {
      for (final subscription in subscriptions) {
        await subscription.cancel();
      }
    };

    return controller.stream;
  }

  Stream<List<TaskItem>> watchTasksForUser(AppUser user) {
    return _firestore.collection('tasks').snapshots().map((snapshot) {
      final all = snapshot.docs
          .map((doc) => TaskItem.fromMap(doc.id, doc.data()))
          .toList()
        ..sort(_sortByDateDescending);
      return _visibleTasks(user, all);
    });
  }

  Stream<List<CertificateItem>> watchCertificatesForUser(AppUser user) {
    return _firestore.collection('certificates').snapshots().map((snapshot) {
      final all = snapshot.docs
          .map((doc) => CertificateItem.fromMap(doc.id, doc.data()))
          .toList()
        ..sort(_sortByDateDescending);
      return _visibleCertificates(user, all);
    });
  }

  Stream<List<ProjectItem>> watchProjects() {
    return _firestore.collection('projects').snapshots().map((snapshot) {
      final items = snapshot.docs
          .map((doc) => ProjectItem.fromMap(doc.id, doc.data()))
          .toList()
        ..sort((left, right) {
          if (left.isFeatured != right.isFeatured) {
            return right.isFeatured ? 1 : -1;
          }
          return _sortByDateDescending(left, right);
        });
      return items;
    });
  }

  Stream<List<AppUser>> watchUsers() {
    return _firestore.collection('users').snapshots().map((snapshot) {
      final items = snapshot.docs
          .map(
            (doc) => AppUser.fromMap(
              uid: doc.id,
              email: (doc.data()['email'] ?? '').toString(),
              fallbackName:
                  (doc.data()['displayName'] ?? doc.data()['name'] ?? '').toString(),
              data: doc.data(),
            ),
          )
          .toList()
        ..sort((left, right) {
          final byRole = left.role.toLowerCase().compareTo(right.role.toLowerCase());
          if (byRole != 0) return byRole;
          return left.displayName.toLowerCase().compareTo(right.displayName.toLowerCase());
        });
      return items;
    });
  }

  Future<void> updateTaskStatus({
    required String id,
    required String status,
  }) {
    return _firestore.collection('tasks').doc(id).set({
      'status': status,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> updateCourse({
    required CourseItem course,
    required Map<String, dynamic> updates,
  }) {
    return _courseCollectionForKind(course.kind).doc(course.id).set({
      ...updates,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Stream<List<EnrollmentItem>> watchEnrollmentsForCourse(CourseItem course) {
    return _enrollmentCollectionForKind(course.kind).snapshots().map((snapshot) {
      return snapshot.docs
          .map(
            (doc) => EnrollmentItem.fromMap(
              doc.id,
              doc.data(),
              kind: course.kind,
            ),
          )
          .where(
            (item) =>
                normalizeText(item.status) == 'active' &&
                _courseMatchesEnrollment(course, item),
          )
          .toList()
        ..sort(_sortByDateDescending);
    });
  }

  Future<int> sendCourseAnnouncement({
    required CourseItem course,
    required AppUser sender,
    required String message,
    String selectedPlanId = '',
    bool includeMeetingLink = false,
  }) async {
    final snapshot = await _enrollmentCollectionForKind(course.kind).get();
    final enrollments = snapshot.docs
        .map(
          (doc) => EnrollmentItem.fromMap(
            doc.id,
            doc.data(),
            kind: course.kind,
          ),
        )
        .where(
          (item) =>
              normalizeText(item.status) == 'active' &&
              _courseMatchesEnrollment(course, item),
        )
        .where((item) {
          if (selectedPlanId.isEmpty) return true;
          return course.resolvePlan(item)?.id == selectedPlanId;
        })
        .toList();

    if (enrollments.isEmpty) {
      return 0;
    }

    final batch = _firestore.batch();
    for (final enrollment in enrollments) {
      final resolvedPlan = course.resolvePlan(enrollment);
      final meetingLink =
          includeMeetingLink ? course.resolveMeetingLink(enrollment) : '';
      final recipientId =
          enrollment.userId.isNotEmpty ? enrollment.userId : enrollment.userEmail;
      final title = resolvedPlan?.label.isNotEmpty == true
          ? '${course.title} • ${resolvedPlan!.label}'
          : '${course.title} update';

      batch.set(
        _firestore.collection('notifications').doc(),
        {
          'recipientId': recipientId,
          'assignedEmployeeRef': sender.uid,
          'recipientEmployeeId': '',
          'type': meetingLink.isNotEmpty ? 'course_meeting' : 'course_update',
          'title': title,
          'message': message,
          'courseId': course.id,
          'courseTitle': course.title,
          'planLabel': resolvedPlan?.label ?? enrollment.planLabel,
          'meetingLink': meetingLink,
          'studentMobile': enrollment.userMobile,
          'read': false,
          'createdAt': FieldValue.serverTimestamp(),
        },
      );
    }

    await batch.commit();
    return enrollments.length;
  }

  Stream<List<ChatRoomItem>> watchChatsForUser(AppUser user) {
    return _firestore
        .collection('chats')
        .where('participants', arrayContains: user.uid)
        .snapshots()
        .map((snapshot) {
      final items = snapshot.docs
          .map((doc) => ChatRoomItem.fromMap(doc.id, doc.data()))
          .toList()
        ..sort(_sortByDateDescending);
      return items;
    });
  }

  Stream<List<ChatMessageItem>> watchChatMessages(String chatId) {
    return _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .snapshots()
        .map((snapshot) {
      final items = snapshot.docs
          .map((doc) => ChatMessageItem.fromMap(doc.id, doc.data()))
          .toList()
        ..sort((left, right) {
          final leftDate = left.timestamp ?? DateTime.fromMillisecondsSinceEpoch(0);
          final rightDate =
              right.timestamp ?? DateTime.fromMillisecondsSinceEpoch(0);
          return leftDate.compareTo(rightDate);
        });
      return items;
    });
  }

  Future<void> markChatRead({
    required String chatId,
    required String currentUserId,
  }) async {
    final snapshot = await _firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .get();

    final unread = snapshot.docs.where((doc) {
      final data = doc.data();
      return (data['senderId'] ?? '').toString() != currentUserId &&
          normalizeText(data['status']) != 'read';
    }).toList();

    if (unread.isEmpty) return;

    final batch = _firestore.batch();
    for (final doc in unread) {
      batch.set(
        doc.reference,
        {
          'status': 'read',
          'readAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    }
    await batch.commit();
  }

  Future<String?> ensureSupportChat(AppUser user) async {
    final supportUser = await _findSupportUser(excludeUid: user.uid);
    if (supportUser == null) return null;

    return createOrGetDirectChat(
      currentUser: user,
      otherUser: supportUser,
    );
  }

  Future<String> createOrGetDirectChat({
    required AppUser currentUser,
    required AppUser otherUser,
  }) async {
    final existing = await _firestore
        .collection('chats')
        .where('participants', arrayContains: currentUser.uid)
        .get();

    for (final doc in existing.docs) {
      final chat = ChatRoomItem.fromMap(doc.id, doc.data());
      if (!chat.isGroup &&
          chat.participants.length == 2 &&
          chat.participants.contains(otherUser.uid)) {
        return doc.id;
      }
    }

    final chatRef = await _firestore.collection('chats').add({
      'participants': [currentUser.uid, otherUser.uid],
      'participantInfo': {
        currentUser.uid: {
          'name': currentUser.displayName,
          'email': currentUser.email,
          'role': currentUser.role,
        },
        otherUser.uid: {
          'name': otherUser.displayName,
          'email': otherUser.email,
          'role': otherUser.role,
        },
      },
      'lastMessage': '',
      'lastMessageAt': FieldValue.serverTimestamp(),
      'createdAt': FieldValue.serverTimestamp(),
    });

    if (currentUser.isCustomer && (otherUser.isAdmin || otherUser.isEmployee)) {
      const welcomeText =
          'Hello! Thanks for reaching out. Support team jaldi aapse connect karegi.';
      await chatRef.collection('messages').add({
        'senderId': otherUser.uid,
        'senderName': otherUser.displayName,
        'senderEmail': otherUser.email,
        'text': welcomeText,
        'timestamp': FieldValue.serverTimestamp(),
        'status': 'sent',
      });
      await chatRef.set(
        {
          'lastMessage': welcomeText,
          'lastMessageAt': FieldValue.serverTimestamp(),
          'lastSenderId': otherUser.uid,
          'lastSenderName': otherUser.displayName,
        },
        SetOptions(merge: true),
      );
    }

    return chatRef.id;
  }

  Future<void> sendChatMessage({
    required String chatId,
    required AppUser sender,
    required String text,
  }) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;

    final chatRef = _firestore.collection('chats').doc(chatId);
    await chatRef.collection('messages').add({
      'senderId': sender.uid,
      'senderName': sender.displayName,
      'senderEmail': sender.email,
      'text': trimmed,
      'timestamp': FieldValue.serverTimestamp(),
      'status': 'sent',
    });

    await chatRef.set(
      {
        'lastMessage': trimmed,
        'lastMessageAt': FieldValue.serverTimestamp(),
        'lastSenderId': sender.uid,
        'lastSenderName': sender.displayName,
      },
      SetOptions(merge: true),
    );
  }

  Future<String> startVideoCall({
    required String chatId,
    required AppUser sender,
  }) async {
    final callUrl = 'https://meet.jit.si/SolutionHub-$chatId';
    final chatRef = _firestore.collection('chats').doc(chatId);

    await chatRef.collection('messages').add({
      'senderId': sender.uid,
      'senderName': sender.displayName,
      'senderEmail': sender.email,
      'text': 'Starting a live meeting...',
      'type': 'video-call',
      'callUrl': callUrl,
      'timestamp': FieldValue.serverTimestamp(),
      'status': 'sent',
    });

    await chatRef.set(
      {
        'lastMessage': '📹 Video Call Started',
        'lastMessageAt': FieldValue.serverTimestamp(),
        'lastSenderId': sender.uid,
        'lastSenderName': sender.displayName,
      },
      SetOptions(merge: true),
    );

    final chatSnapshot = await chatRef.get();
    if (chatSnapshot.exists) {
      final chat = ChatRoomItem.fromMap(chatSnapshot.id, chatSnapshot.data() ?? {});
      await _notifyParticipants(
        participantIds: chat.participants.where((item) => item != sender.uid).toList(),
        title: 'Live meeting started',
        message: '${sender.displayName} ne live meeting start ki hai.',
        type: 'live_meeting',
        meetingLink: callUrl,
      );
    }

    return callUrl;
  }

  bool _notificationMatchesUser(AppNotificationItem item, AppUser user) {
    final identities = user.identityKeys.toSet();
    return identities.contains(normalizeText(item.recipientId)) ||
        identities.contains(normalizeText(item.recipientEmployeeId)) ||
        identities.contains(normalizeText(item.assignedEmployeeRef));
  }

  List<CourseItem> _visibleCourses(
    AppUser user,
    List<CourseItem> allCourses,
    List<EnrollmentItem> allEnrollments,
  ) {
    if (user.isAdmin) {
      return [...allCourses]..sort(_sortByDateDescending);
    }

    if (user.isCustomer) {
      final myEnrollments = allEnrollments.where((item) => item.matchesCustomer(user));
      final items = <String, CourseItem>{};

      for (final enrollment in myEnrollments) {
        final match = allCourses.cast<CourseItem?>().firstWhere(
              (course) =>
                  course != null &&
                  ((enrollment.courseId.isNotEmpty &&
                          course.id == enrollment.courseId) ||
                      normalizeText(course.title) ==
                          normalizeText(enrollment.courseTitle)),
              orElse: () => null,
            );

        final course = match ?? CourseItem.fromEnrollmentFallback(enrollment);
        items['${course.id}:${course.kind}'] = course;
      }

      final list = items.values.toList()..sort(_sortByDateDescending);
      return list;
    }

    return allCourses.where((course) => course.matchesEmployee(user)).toList()
      ..sort(_sortByDateDescending);
  }

  List<EnrollmentItem> _visibleEnrollments(
    AppUser user,
    List<CourseItem> visibleCourses,
    List<EnrollmentItem> allEnrollments,
  ) {
    if (user.isAdmin) {
      return [...allEnrollments]..sort(_sortByDateDescending);
    }

    if (user.isCustomer) {
      return allEnrollments
          .where((item) => item.matchesCustomer(user))
          .toList()
        ..sort(_sortByDateDescending);
    }

    final courseIds = visibleCourses.map((course) => course.id).toSet();
    final courseTitles =
        visibleCourses.map((course) => normalizeText(course.title)).toSet();

    return allEnrollments
        .where(
          (item) =>
              item.matchesEmployee(user) ||
              courseIds.contains(item.courseId) ||
              courseTitles.contains(normalizeText(item.courseTitle)),
        )
        .toList()
      ..sort(_sortByDateDescending);
  }

  List<TaskItem> _visibleTasks(AppUser user, List<TaskItem> allTasks) {
    if (user.isAdmin) {
      return [...allTasks]..sort(_sortByDateDescending);
    }

    return allTasks.where((task) => task.matchesUser(user)).toList()
      ..sort(_sortByDateDescending);
  }

  List<CertificateItem> _visibleCertificates(
    AppUser user,
    List<CertificateItem> allCertificates,
  ) {
    if (user.isAdmin) {
      return [...allCertificates]..sort(_sortByDateDescending);
    }

    return allCertificates.where((item) => item.matchesUser(user)).toList()
      ..sort(_sortByDateDescending);
  }

  List<CourseItem> _attachStudentCounts(
    List<CourseItem> courses,
    List<EnrollmentItem> enrollments,
  ) {
    return courses.map((course) {
      final count = enrollments
          .where(
            (item) =>
                normalizeText(item.status) == 'active' &&
                ((item.courseId.isNotEmpty && item.courseId == course.id) ||
                    normalizeText(item.courseTitle) ==
                        normalizeText(course.title)),
          )
          .length;

      return course.copyWith(
        studentCount: count == 0 ? course.studentCount : count,
      );
    }).toList();
  }

  CollectionReference<Map<String, dynamic>> _courseCollectionForKind(String kind) {
    return _firestore
        .collection(normalizeText(kind) == 'trading' ? 'tradingCourses' : 'courses');
  }

  CollectionReference<Map<String, dynamic>> _enrollmentCollectionForKind(
    String kind,
  ) {
    return _firestore.collection(
      normalizeText(kind) == 'trading' ? 'tradingEnrollments' : 'enrollments',
    );
  }

  bool _courseMatchesEnrollment(CourseItem course, EnrollmentItem enrollment) {
    return (enrollment.courseId.isNotEmpty && enrollment.courseId == course.id) ||
        normalizeText(enrollment.courseTitle) == normalizeText(course.title);
  }

  Future<AppUser?> _findSupportUser({String excludeUid = ''}) async {
    for (final role in const ['admin', 'employee']) {
      final snapshot = await _firestore
          .collection('users')
          .where('role', isEqualTo: role)
          .limit(10)
          .get();

      for (final doc in snapshot.docs) {
        if (doc.id == excludeUid) continue;
        final user = AppUser.fromMap(
          uid: doc.id,
          email: (doc.data()['email'] ?? '').toString(),
          fallbackName: (doc.data()['displayName'] ?? doc.data()['name'] ?? '')
              .toString(),
          data: doc.data(),
        );

        if (normalizeText(user.status) != 'inactive') {
          return user;
        }
      }
    }

    return null;
  }

  Future<void> _notifyParticipants({
    required List<String> participantIds,
    required String title,
    required String message,
    required String type,
    String meetingLink = '',
  }) async {
    final uniqueIds = participantIds.toSet().where((item) => item.isNotEmpty).toList();
    if (uniqueIds.isEmpty) return;

    final batch = _firestore.batch();
    for (final participantId in uniqueIds) {
      batch.set(
        _firestore.collection('notifications').doc(),
        {
          'recipientId': participantId,
          'type': type,
          'title': title,
          'message': message,
          'meetingLink': meetingLink,
          'read': false,
          'createdAt': FieldValue.serverTimestamp(),
        },
      );
    }
    await batch.commit();
  }

  int _sortByDateDescending(dynamic left, dynamic right) {
    final leftDate = _extractDate(left);
    final rightDate = _extractDate(right);
    return rightDate.compareTo(leftDate);
  }

  DateTime _extractDate(dynamic item) {
    if (item is AppNotificationItem) {
      return item.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
    }
    if (item is CourseItem) {
      return item.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
    }
    if (item is EnrollmentItem) {
      return item.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
    }
    if (item is TaskItem) {
      return item.dueDate ??
          item.createdAt ??
          DateTime.fromMillisecondsSinceEpoch(0);
    }
    if (item is CertificateItem) {
      return item.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
    }
    if (item is ChatRoomItem) {
      return item.lastMessageAt ??
          item.createdAt ??
          DateTime.fromMillisecondsSinceEpoch(0);
    }
    if (item is ChatMessageItem) {
      return item.timestamp ?? DateTime.fromMillisecondsSinceEpoch(0);
    }
    return DateTime.fromMillisecondsSinceEpoch(0);
  }
}
