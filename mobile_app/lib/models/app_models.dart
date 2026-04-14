import 'package:cloud_firestore/cloud_firestore.dart';

String normalizeText(dynamic value) =>
    value == null ? '' : value.toString().trim().toLowerCase();

DateTime? parseDateTime(dynamic value) {
  if (value == null) return null;
  if (value is Timestamp) return value.toDate();
  if (value is DateTime) return value;
  if (value is int) return DateTime.fromMillisecondsSinceEpoch(value);
  if (value is num) return DateTime.fromMillisecondsSinceEpoch(value.toInt());
  if (value is String) return DateTime.tryParse(value);
  return null;
}

double parseAmount(dynamic value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

int parseCount(dynamic value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

bool parseFlag(dynamic value, {bool fallback = false}) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  if (value is String) {
    final normalized = normalizeText(value);
    if (normalized == 'true' || normalized == 'yes' || normalized == 'active') {
      return true;
    }
    if (normalized == 'false' || normalized == 'no' || normalized == 'inactive') {
      return false;
    }
  }
  return fallback;
}

Map<String, bool> parsePermissionMap(dynamic value) {
  if (value is! Map) return const {};
  return value.map(
    (key, item) => MapEntry(key.toString(), parseFlag(item)),
  );
}

String compactText(dynamic value) =>
    normalizeText(value).replaceAll(RegExp(r'[^a-z0-9]'), '');

List<String> parseStringList(dynamic value) {
  if (value is! List) return const [];
  return value
      .map((item) => item.toString().trim())
      .where((item) => item.isNotEmpty)
      .toList(growable: false);
}

List<Map<String, dynamic>> parseMapList(dynamic value) {
  if (value is! List) return const [];
  return value
      .whereType<Map>()
      .map((item) => Map<String, dynamic>.from(item))
      .toList(growable: false);
}

class AppUser {
  const AppUser({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.role,
    required this.status,
    required this.phone,
    required this.employeeId,
    required this.department,
    required this.permissions,
  });

  final String uid;
  final String email;
  final String displayName;
  final String role;
  final String status;
  final String phone;
  final String employeeId;
  final String department;
  final Map<String, bool> permissions;

  factory AppUser.fromMap({
    required String uid,
    required String? email,
    required String? fallbackName,
    required Map<String, dynamic>? data,
  }) {
    final payload = data ?? <String, dynamic>{};
    return AppUser(
      uid: uid,
      email: (payload['email'] ?? email ?? '').toString(),
      displayName:
          (payload['displayName'] ?? payload['name'] ?? fallbackName ?? 'Member')
              .toString(),
      role: (payload['role'] ?? 'customer').toString(),
      status: (payload['status'] ?? 'active').toString(),
      phone: (payload['phone'] ?? payload['mobile'] ?? '').toString(),
      employeeId: (payload['employeeId'] ?? '').toString(),
      department: (payload['department'] ?? '').toString(),
      permissions: parsePermissionMap(payload['permissions']),
    );
  }

  bool get isAdmin => normalizeText(role) == 'admin';
  bool get isCustomer => normalizeText(role) == 'customer';
  bool get isEmployee => !isAdmin && !isCustomer;

  String get initials {
    final parts = displayName.split(RegExp(r'\s+')).where((item) => item.isNotEmpty);
    return parts.take(2).map((item) => item[0].toUpperCase()).join();
  }

  List<String> get identityKeys {
    return {
      normalizeText(uid),
      normalizeText(email),
      normalizeText(employeeId),
      normalizeText(displayName),
    }.where((item) => item.isNotEmpty).toList();
  }
}

class AppNotificationItem {
  const AppNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.read,
    required this.createdAt,
    required this.recipientId,
    required this.recipientEmployeeId,
    required this.assignedEmployeeRef,
    required this.courseId,
    required this.courseTitle,
    required this.planLabel,
    required this.meetingLink,
    required this.callUrl,
    required this.studentMobile,
  });

  final String id;
  final String title;
  final String message;
  final String type;
  final bool read;
  final DateTime? createdAt;
  final String recipientId;
  final String recipientEmployeeId;
  final String assignedEmployeeRef;
  final String courseId;
  final String courseTitle;
  final String planLabel;
  final String meetingLink;
  final String callUrl;
  final String studentMobile;

  factory AppNotificationItem.fromMap(String id, Map<String, dynamic> data) {
    return AppNotificationItem(
      id: id,
      title: (data['title'] ?? 'Notification').toString(),
      message: (data['message'] ?? '').toString(),
      type: (data['type'] ?? 'general').toString(),
      read: parseFlag(data['read']),
      createdAt: parseDateTime(data['createdAt']),
      recipientId: (data['recipientId'] ?? '').toString(),
      recipientEmployeeId: (data['recipientEmployeeId'] ?? '').toString(),
      assignedEmployeeRef: (data['assignedEmployeeRef'] ?? '').toString(),
      courseId: (data['courseId'] ?? '').toString(),
      courseTitle: (data['courseTitle'] ?? '').toString(),
      planLabel: (data['planLabel'] ?? '').toString(),
      meetingLink:
          (data['meetingLink'] ?? data['callUrl'] ?? data['sessionLink'] ?? '')
              .toString(),
      callUrl: (data['callUrl'] ?? '').toString(),
      studentMobile: (data['studentMobile'] ?? '').toString(),
    );
  }
}

class CourseMaterialItem {
  const CourseMaterialItem({
    required this.title,
    required this.url,
  });

  final String title;
  final String url;

  factory CourseMaterialItem.fromDynamic(dynamic value) {
    if (value is String) {
      return CourseMaterialItem(title: 'Material', url: value);
    }

    final payload = value is Map<String, dynamic>
        ? value
        : value is Map
            ? Map<String, dynamic>.from(value)
            : <String, dynamic>{};

    return CourseMaterialItem(
      title: (payload['title'] ?? payload['name'] ?? payload['label'] ?? 'Material')
          .toString(),
      url: (payload['url'] ?? payload['link'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'url': url,
    };
  }
}

class CoursePlanItem {
  const CoursePlanItem({
    required this.id,
    required this.label,
    required this.duration,
    required this.price,
    required this.isFree,
    required this.highlighted,
    required this.features,
    required this.meetingLink,
    required this.meetingStartsAt,
    required this.meetingTimezone,
  });

  final String id;
  final String label;
  final String duration;
  final double price;
  final bool isFree;
  final bool highlighted;
  final List<String> features;
  final String meetingLink;
  final DateTime? meetingStartsAt;
  final String meetingTimezone;

  factory CoursePlanItem.fromDynamic(
    dynamic value, {
    int? index,
  }) {
    final payload = value is Map<String, dynamic>
        ? value
        : value is Map
            ? Map<String, dynamic>.from(value)
            : <String, dynamic>{};

    final label = (payload['label'] ?? payload['name'] ?? 'Plan').toString();

    return CoursePlanItem(
      id: (payload['id'] ?? compactText(label) ?? '').toString().isNotEmpty
          ? (payload['id'] ?? compactText(label)).toString()
          : 'plan-${index ?? 0}',
      label: label,
      duration: (payload['duration'] ?? '').toString(),
      price: parseAmount(payload['price']),
      isFree: parseFlag(
        payload['isFree'],
        fallback: parseAmount(payload['price']) == 0,
      ),
      highlighted: parseFlag(payload['highlighted']),
      features: parseStringList(payload['features']),
      meetingLink: (payload['meetingLink'] ?? '').toString(),
      meetingStartsAt: parseDateTime(payload['meetingStartsAt']),
      meetingTimezone: (payload['meetingTimezone'] ?? '').toString(),
    );
  }

  bool get meetingReady => meetingLink.isNotEmpty;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'label': label,
      'duration': duration,
      'price': price,
      'isFree': isFree,
      'highlighted': highlighted,
      'features': features,
      'meetingLink': meetingLink,
      'meetingStartsAt': meetingStartsAt?.toIso8601String(),
      'meetingTimezone': meetingTimezone,
    };
  }
}

class CourseItem {
  const CourseItem({
    required this.id,
    required this.title,
    required this.kind,
    required this.category,
    required this.description,
    required this.assignedEmployeeId,
    required this.assignedEmployeeRef,
    required this.status,
    required this.published,
    required this.highlighted,
    required this.meetingLink,
    required this.meetingReady,
    required this.plansCount,
    required this.materialsCount,
    required this.studentCount,
    required this.price,
    required this.plans,
    required this.materials,
    required this.createdAt,
  });

  final String id;
  final String title;
  final String kind;
  final String category;
  final String description;
  final String assignedEmployeeId;
  final String assignedEmployeeRef;
  final String status;
  final bool published;
  final bool highlighted;
  final String meetingLink;
  final bool meetingReady;
  final int plansCount;
  final int materialsCount;
  final int studentCount;
  final double price;
  final List<CoursePlanItem> plans;
  final List<CourseMaterialItem> materials;
  final DateTime? createdAt;

  factory CourseItem.fromGenericMap(String id, Map<String, dynamic> data) {
    final parsedPlans = parseMapList(data['plans'])
        .asMap()
        .entries
        .map((entry) => CoursePlanItem.fromDynamic(entry.value, index: entry.key))
        .toList(growable: false);
    final parsedMaterials = (data['materials'] is List)
        ? (data['materials'] as List)
            .map(CourseMaterialItem.fromDynamic)
            .where((item) => item.url.isNotEmpty)
            .toList(growable: false)
        : const <CourseMaterialItem>[];
    final meetingLink = (data['meetingLink'] ?? '').toString();
    return CourseItem(
      id: id,
      title: (data['title'] ?? 'Untitled Course').toString(),
      kind: 'Course',
      category: (data['category'] ?? 'General').toString(),
      description: (data['description'] ?? data['summary'] ?? '').toString(),
      assignedEmployeeId: (data['assignedEmployeeId'] ?? '').toString(),
      assignedEmployeeRef: (data['assignedEmployeeRef'] ?? '').toString(),
      status: (data['status'] ?? '').toString(),
      published: parseFlag(data['published']),
      highlighted: parseFlag(data['highlighted']),
      meetingLink: meetingLink,
      meetingReady:
          meetingLink.isNotEmpty || parsedPlans.any((plan) => plan.meetingReady),
      plansCount: parsedPlans.length,
      materialsCount: parsedMaterials.length,
      studentCount: parseCount(data['enrolledCount']),
      price: parseAmount(data['price'] ?? data['amount']),
      plans: parsedPlans,
      materials: parsedMaterials,
      createdAt: parseDateTime(data['createdAt']),
    );
  }

  factory CourseItem.fromTradingMap(String id, Map<String, dynamic> data) {
    final parsedPlans = parseMapList(data['plans'])
        .asMap()
        .entries
        .map((entry) => CoursePlanItem.fromDynamic(entry.value, index: entry.key))
        .toList(growable: false);
    final parsedMaterials = (data['materials'] is List)
        ? (data['materials'] as List)
            .map(CourseMaterialItem.fromDynamic)
            .where((item) => item.url.isNotEmpty)
            .toList(growable: false)
        : const <CourseMaterialItem>[];
    final meetingLink =
        (data['meetingLink'] ?? data['sessionLink'] ?? '').toString();
    return CourseItem(
      id: id,
      title: (data['title'] ?? data['name'] ?? 'Trading Course').toString(),
      kind: 'Trading',
      category: (data['category'] ?? 'Trading').toString(),
      description: (data['description'] ?? '').toString(),
      assignedEmployeeId: (data['assignedEmployeeId'] ?? '').toString(),
      assignedEmployeeRef: (data['assignedEmployeeRef'] ?? '').toString(),
      status: (data['status'] ?? '').toString(),
      published: parseFlag(data['published'], fallback: true),
      highlighted: parseFlag(data['highlighted']),
      meetingLink: meetingLink,
      meetingReady: parseFlag(data['isLive']) ||
          meetingLink.isNotEmpty ||
          parsedPlans.any((plan) => plan.meetingReady),
      plansCount:
          parsedPlans.isNotEmpty ? parsedPlans.length : parseCount(data['sessionCount']),
      materialsCount: parsedMaterials.isNotEmpty
          ? parsedMaterials.length
          : parseCount(data['materialCount']),
      studentCount: parseCount(data['studentCount']),
      price: parseAmount(data['price'] ?? data['amount']),
      plans: parsedPlans,
      materials: parsedMaterials,
      createdAt: parseDateTime(data['createdAt']),
    );
  }

  factory CourseItem.fromEnrollmentFallback(EnrollmentItem enrollment) {
    return CourseItem(
      id: enrollment.courseId.isNotEmpty ? enrollment.courseId : enrollment.id,
      title: enrollment.courseTitle.isNotEmpty ? enrollment.courseTitle : 'My Course',
      kind: enrollment.kind,
      category: enrollment.kind,
      description: '',
      assignedEmployeeId: enrollment.assignedEmployeeId,
      assignedEmployeeRef: enrollment.assignedEmployeeRef,
      status: enrollment.status,
      published: true,
      highlighted: false,
      meetingLink: '',
      meetingReady: false,
      plansCount: 0,
      materialsCount: 0,
      studentCount: 0,
      price: enrollment.amount,
      plans: const [],
      materials: const [],
      createdAt: enrollment.createdAt,
    );
  }

  CourseItem copyWith({
    int? studentCount,
    String? meetingLink,
    List<CoursePlanItem>? plans,
    List<CourseMaterialItem>? materials,
  }) {
    final nextPlans = plans ?? this.plans;
    final nextMaterials = materials ?? this.materials;
    final nextMeetingLink = meetingLink ?? this.meetingLink;

    return CourseItem(
      id: id,
      title: title,
      kind: kind,
      category: category,
      description: description,
      assignedEmployeeId: assignedEmployeeId,
      assignedEmployeeRef: assignedEmployeeRef,
      status: status,
      published: published,
      highlighted: highlighted,
      meetingLink: nextMeetingLink,
      meetingReady:
          nextMeetingLink.isNotEmpty || nextPlans.any((plan) => plan.meetingReady),
      plansCount: nextPlans.length,
      materialsCount: nextMaterials.length,
      studentCount: studentCount ?? this.studentCount,
      price: price,
      plans: nextPlans,
      materials: nextMaterials,
      createdAt: createdAt,
    );
  }

  bool matchesEmployee(AppUser user) {
    final identities = user.identityKeys.toSet();
    return identities.contains(normalizeText(assignedEmployeeId)) ||
        identities.contains(normalizeText(assignedEmployeeRef));
  }

  CoursePlanItem? resolvePlan(EnrollmentItem? enrollment) {
    if (plans.isEmpty) return null;
    if (enrollment == null) {
      return plans.length == 1 ? plans.first : null;
    }

    final planKeys = [
      normalizeText(enrollment.planId),
      normalizeText(enrollment.planLabel),
      normalizeText(enrollment.planName),
    ].where((item) => item.isNotEmpty).toList();

    final compactPlanKeys = [
      compactText(enrollment.planId),
      compactText(enrollment.planLabel),
      compactText(enrollment.planName),
    ].where((item) => item.isNotEmpty).toList();

    if (planKeys.isEmpty && compactPlanKeys.isEmpty) {
      final amountMatches = plans.where((plan) {
        final planAmount = plan.isFree ? 0 : plan.price;
        return planAmount == enrollment.amount;
      }).toList();

      if (amountMatches.length == 1) {
        return amountMatches.first;
      }

      return plans.length == 1 ? plans.first : null;
    }

    for (final plan in plans) {
      final normalizedId = normalizeText(plan.id);
      final normalizedLabel = normalizeText(plan.label);
      final compactId = compactText(plan.id);
      final compactLabel = compactText(plan.label);

      if (planKeys.contains(normalizedId) ||
          planKeys.contains(normalizedLabel) ||
          compactPlanKeys.contains(compactId) ||
          compactPlanKeys.contains(compactLabel)) {
        return plan;
      }
    }

    final amountMatches = plans.where((plan) {
      final planAmount = plan.isFree ? 0 : plan.price;
      return planAmount == enrollment.amount;
    }).toList();

    if (amountMatches.length == 1) {
      return amountMatches.first;
    }

    return plans.length == 1 ? plans.first : null;
  }

  String resolveMeetingLink(EnrollmentItem? enrollment) {
    final plan = resolvePlan(enrollment);
    if (plan?.meetingLink.isNotEmpty == true) {
      return plan!.meetingLink;
    }

    if (plans.length <= 1) {
      return meetingLink;
    }

    return '';
  }

  DateTime? resolveMeetingTime(EnrollmentItem? enrollment) {
    return resolvePlan(enrollment)?.meetingStartsAt;
  }
}

class EnrollmentItem {
  const EnrollmentItem({
    required this.id,
    required this.courseId,
    required this.courseTitle,
    required this.userId,
    required this.userEmail,
    required this.userName,
    required this.userMobile,
    required this.assignedEmployeeId,
    required this.assignedEmployeeRef,
    required this.planId,
    required this.planLabel,
    required this.planName,
    required this.status,
    required this.amount,
    required this.kind,
    required this.createdAt,
  });

  final String id;
  final String courseId;
  final String courseTitle;
  final String userId;
  final String userEmail;
  final String userName;
  final String userMobile;
  final String assignedEmployeeId;
  final String assignedEmployeeRef;
  final String planId;
  final String planLabel;
  final String planName;
  final String status;
  final double amount;
  final String kind;
  final DateTime? createdAt;

  factory EnrollmentItem.fromMap(
    String id,
    Map<String, dynamic> data, {
    required String kind,
  }) {
    return EnrollmentItem(
      id: id,
      courseId: (data['courseId'] ?? '').toString(),
      courseTitle: (data['courseTitle'] ?? data['courseName'] ?? '').toString(),
      userId: (data['userId'] ?? data['uid'] ?? '').toString(),
      userEmail: (data['userEmail'] ?? data['studentEmail'] ?? '').toString(),
      userName: (data['userName'] ?? data['studentName'] ?? '').toString(),
      userMobile: (data['userMobile'] ?? data['studentMobile'] ?? '').toString(),
      assignedEmployeeId: (data['assignedEmployeeId'] ?? '').toString(),
      assignedEmployeeRef: (data['assignedEmployeeRef'] ?? '').toString(),
      planId: (data['planId'] ?? '').toString(),
      planLabel: (data['planLabel'] ?? '').toString(),
      planName: (data['planName'] ?? '').toString(),
      status: (data['status'] ?? 'active').toString(),
      amount: parseAmount(data['amount']),
      kind: kind,
      createdAt: parseDateTime(data['enrolledAt'] ?? data['createdAt']),
    );
  }

  bool matchesCustomer(AppUser user) {
    return normalizeText(userId) == normalizeText(user.uid) ||
        normalizeText(userEmail) == normalizeText(user.email);
  }

  bool matchesEmployee(AppUser user) {
    final identities = user.identityKeys.toSet();
    return identities.contains(normalizeText(assignedEmployeeId)) ||
        identities.contains(normalizeText(assignedEmployeeRef));
  }
}

class TaskItem {
  const TaskItem({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.assignee,
    required this.assignedTo,
    required this.project,
    required this.dueDate,
    required this.createdAt,
  });

  final String id;
  final String title;
  final String description;
  final String status;
  final String assignee;
  final String assignedTo;
  final String project;
  final DateTime? dueDate;
  final DateTime? createdAt;

  factory TaskItem.fromMap(String id, Map<String, dynamic> data) {
    return TaskItem(
      id: id,
      title: (data['title'] ?? data['taskTitle'] ?? 'Task').toString(),
      description: (data['description'] ?? data['taskDesc'] ?? '').toString(),
      status: (data['status'] ?? 'pending').toString(),
      assignee: (data['assignee'] ?? '').toString(),
      assignedTo: (data['assignedTo'] ?? '').toString(),
      project: (data['project'] ?? '').toString(),
      dueDate: parseDateTime(data['dueDate']),
      createdAt: parseDateTime(data['createdAt']),
    );
  }

  bool matchesUser(AppUser user) {
    final identities = user.identityKeys.toSet();
    return identities.contains(normalizeText(assignee)) ||
        identities.contains(normalizeText(assignedTo));
  }

  bool get isDone {
    const doneStates = {'done', 'completed', 'complete', 'closed'};
    return doneStates.contains(normalizeText(status));
  }
}

class ProjectItem {
  const ProjectItem({
    required this.id,
    required this.title,
    required this.description,
    required this.longDescription,
    required this.slug,
    required this.categoryName,
    required this.categorySlug,
    required this.imageUrl,
    required this.status,
    required this.active,
    required this.isFeatured,
    required this.projectOnlyPrice,
    required this.projectWithSourcePrice,
    required this.sales,
    required this.sellerEmail,
    required this.createdAt,
  });

  final String id;
  final String title;
  final String description;
  final String longDescription;
  final String slug;
  final String categoryName;
  final String categorySlug;
  final String imageUrl;
  final String status;
  final bool active;
  final bool isFeatured;
  final double projectOnlyPrice;
  final double projectWithSourcePrice;
  final int sales;
  final String sellerEmail;
  final DateTime? createdAt;

  factory ProjectItem.fromMap(String id, Map<String, dynamic> data) {
    final title = (data['title'] ?? data['name'] ?? 'Project').toString();
    final categoryName =
        (data['category_name'] ?? data['categoryName'] ?? data['category'] ?? 'General')
            .toString();
    final status = (data['status'] ?? 'active').toString();
    final active = parseFlag(
      data['is_active'] ?? data['isActive'],
      fallback: const {'active', 'published', 'live'}.contains(normalizeText(status)),
    );
    final projectOnlyPrice = parseAmount(
      data['price_project_only'] ?? data['priceProjectOnly'] ?? data['price'],
    );
    final projectWithSourcePrice = parseAmount(
      data['price_with_source'] ??
          data['priceWithSource'] ??
          data['sourcePrice'] ??
          data['price_project_only'] ??
          data['priceProjectOnly'] ??
          data['price'],
    );

    return ProjectItem(
      id: id,
      title: title,
      description: (data['description'] ?? data['summary'] ?? '').toString(),
      longDescription:
          (data['longDescription'] ?? data['details'] ?? data['fullDescription'] ?? '')
              .toString(),
      slug: (data['slug'] ?? compactText(title)).toString(),
      categoryName: categoryName,
      categorySlug:
          (data['category_slug'] ?? data['categorySlug'] ?? compactText(categoryName))
              .toString(),
      imageUrl:
          (data['image_url'] ?? data['thumbnail'] ?? data['imageUrl'] ?? '').toString(),
      status: status,
      active: active,
      isFeatured: parseFlag(
        data['is_featured'] ?? data['featured'] ?? data['isFeatured'],
      ),
      projectOnlyPrice: projectOnlyPrice,
      projectWithSourcePrice: projectWithSourcePrice <= 0
          ? projectOnlyPrice
          : projectWithSourcePrice,
      sales: parseCount(data['sales']),
      sellerEmail:
          (data['seller_email'] ?? data['sellerEmail'] ?? data['createdByEmail'] ?? '')
              .toString(),
      createdAt: parseDateTime(data['createdAt']),
    );
  }

  bool matchesSeller(AppUser user) {
    return normalizeText(sellerEmail) == normalizeText(user.email);
  }
}

class CertificateItem {
  const CertificateItem({
    required this.id,
    required this.courseName,
    required this.certificateId,
    required this.documentLabel,
    required this.status,
    required this.userId,
    required this.studentEmail,
    required this.downloadUrl,
    required this.previewUrl,
    required this.createdAt,
  });

  final String id;
  final String courseName;
  final String certificateId;
  final String documentLabel;
  final String status;
  final String userId;
  final String studentEmail;
  final String downloadUrl;
  final String previewUrl;
  final DateTime? createdAt;

  factory CertificateItem.fromMap(String id, Map<String, dynamic> data) {
    return CertificateItem(
      id: id,
      courseName: (data['courseName'] ?? data['courseTitle'] ?? '').toString(),
      certificateId:
          (data['certificate_id'] ?? data['certId'] ?? data['certificateId'] ?? '')
              .toString(),
      documentLabel: (data['documentLabel'] ?? data['documentType'] ?? 'Certificate')
          .toString(),
      status: (data['status'] ?? 'pending').toString(),
      userId: (data['userId'] ?? data['uid'] ?? '').toString(),
      studentEmail: (data['studentEmail'] ?? data['email'] ?? '').toString(),
      downloadUrl: (data['downloadUrl'] ??
              data['fileUrl'] ??
              data['pdfUrl'] ??
              data['pngUrl'] ??
              '')
          .toString(),
      previewUrl: (data['previewUrl'] ?? data['verifyUrl'] ?? '').toString(),
      createdAt: parseDateTime(data['createdAt']),
    );
  }

  bool matchesUser(AppUser user) {
    return normalizeText(userId) == normalizeText(user.uid) ||
        normalizeText(studentEmail) == normalizeText(user.email);
  }
}

class ChatParticipantInfo {
  const ChatParticipantInfo({
    required this.uid,
    required this.name,
    required this.email,
    required this.role,
  });

  final String uid;
  final String name;
  final String email;
  final String role;

  factory ChatParticipantInfo.fromMap(String uid, Map<String, dynamic>? data) {
    final payload = data ?? <String, dynamic>{};
    return ChatParticipantInfo(
      uid: uid,
      name: (payload['name'] ?? payload['displayName'] ?? 'User').toString(),
      email: (payload['email'] ?? '').toString(),
      role: (payload['role'] ?? 'user').toString(),
    );
  }
}

class ChatRoomItem {
  const ChatRoomItem({
    required this.id,
    required this.participants,
    required this.participantInfo,
    required this.groupName,
    required this.isGroup,
    required this.lastMessage,
    required this.lastMessageAt,
    required this.lastSenderId,
    required this.lastSenderName,
    required this.createdAt,
  });

  final String id;
  final List<String> participants;
  final Map<String, ChatParticipantInfo> participantInfo;
  final String groupName;
  final bool isGroup;
  final String lastMessage;
  final DateTime? lastMessageAt;
  final String lastSenderId;
  final String lastSenderName;
  final DateTime? createdAt;

  factory ChatRoomItem.fromMap(String id, Map<String, dynamic> data) {
    final infoPayload = data['participantInfo'];
    final infoMap = <String, ChatParticipantInfo>{};
    if (infoPayload is Map) {
      for (final entry in infoPayload.entries) {
        final value = entry.value is Map<String, dynamic>
            ? entry.value as Map<String, dynamic>
            : entry.value is Map
                ? Map<String, dynamic>.from(entry.value)
                : <String, dynamic>{};
        infoMap[entry.key.toString()] =
            ChatParticipantInfo.fromMap(entry.key.toString(), value);
      }
    }

    return ChatRoomItem(
      id: id,
      participants: parseStringList(data['participants']),
      participantInfo: infoMap,
      groupName: (data['groupName'] ?? '').toString(),
      isGroup: parseFlag(data['isGroup']),
      lastMessage: (data['lastMessage'] ?? '').toString(),
      lastMessageAt: parseDateTime(data['lastMessageAt']),
      lastSenderId: (data['lastSenderId'] ?? '').toString(),
      lastSenderName: (data['lastSenderName'] ?? '').toString(),
      createdAt: parseDateTime(data['createdAt']),
    );
  }

  ChatParticipantInfo? partnerFor(String uid) {
    if (isGroup) return null;
    final partnerId = participants.firstWhere(
      (item) => item != uid,
      orElse: () => '',
    );
    if (partnerId.isEmpty) return null;
    return participantInfo[partnerId];
  }

  String titleFor(String uid) {
    if (isGroup && groupName.isNotEmpty) {
      return groupName;
    }
    return partnerFor(uid)?.name ?? 'Conversation';
  }

  String subtitleFor(String uid) {
    if (lastMessage.isNotEmpty) return lastMessage;
    if (isGroup) return 'Group conversation';
    final partner = partnerFor(uid);
    if (partner == null) return 'No messages yet';
    return partner.role.isEmpty ? 'No messages yet' : partner.role;
  }
}

class ChatMessageItem {
  const ChatMessageItem({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.senderEmail,
    required this.text,
    required this.imageUrl,
    required this.type,
    required this.callUrl,
    required this.timestamp,
    required this.status,
  });

  final String id;
  final String senderId;
  final String senderName;
  final String senderEmail;
  final String text;
  final String imageUrl;
  final String type;
  final String callUrl;
  final DateTime? timestamp;
  final String status;

  factory ChatMessageItem.fromMap(String id, Map<String, dynamic> data) {
    return ChatMessageItem(
      id: id,
      senderId: (data['senderId'] ?? '').toString(),
      senderName: (data['senderName'] ?? '').toString(),
      senderEmail: (data['senderEmail'] ?? '').toString(),
      text: (data['text'] ?? '').toString(),
      imageUrl: (data['imageUrl'] ?? '').toString(),
      type: (data['type'] ?? 'text').toString(),
      callUrl: (data['callUrl'] ?? '').toString(),
      timestamp: parseDateTime(data['timestamp']),
      status: (data['status'] ?? 'sent').toString(),
    );
  }

  bool get isVideoCall => normalizeText(type) == 'video-call';
}

class AnnouncementItem {
  const AnnouncementItem({
    required this.enabled,
    required this.title,
    required this.message,
    required this.ctaLabel,
    required this.ctaUrl,
  });

  final bool enabled;
  final String title;
  final String message;
  final String ctaLabel;
  final String ctaUrl;

  factory AnnouncementItem.disabled() {
    return const AnnouncementItem(
      enabled: false,
      title: '',
      message: '',
      ctaLabel: '',
      ctaUrl: '',
    );
  }

  factory AnnouncementItem.fromMap(Map<String, dynamic>? data) {
    final payload = data ?? <String, dynamic>{};
    return AnnouncementItem(
      enabled: parseFlag(payload['enabled'], fallback: payload.isNotEmpty),
      title: (payload['title'] ?? 'Announcement').toString(),
      message: (payload['message'] ?? '').toString(),
      ctaLabel: (payload['ctaLabel'] ?? payload['buttonText'] ?? '').toString(),
      ctaUrl: (payload['ctaUrl'] ?? payload['buttonUrl'] ?? '').toString(),
    );
  }
}

class HomeDashboardData {
  const HomeDashboardData({
    required this.courses,
    required this.enrollments,
    required this.tasks,
    required this.notifications,
    required this.certificates,
    required this.announcement,
  });

  final List<CourseItem> courses;
  final List<EnrollmentItem> enrollments;
  final List<TaskItem> tasks;
  final List<AppNotificationItem> notifications;
  final List<CertificateItem> certificates;
  final AnnouncementItem announcement;

  factory HomeDashboardData.empty() {
    return HomeDashboardData(
      courses: const [],
      enrollments: const [],
      tasks: const [],
      notifications: const [],
      certificates: const [],
      announcement: AnnouncementItem.disabled(),
    );
  }

  int get unreadNotificationCount =>
      notifications.where((item) => !item.read).length;

  int get pendingTaskCount => tasks.where((item) => !item.isDone).length;

  int get activeStudentCount => enrollments
      .where((item) => normalizeText(item.status) == 'active')
      .length;
}
