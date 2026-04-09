import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/app_config.dart';
import '../state/session_controller.dart';
import '../widgets/brand_logo.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();
  final _signupNameController = TextEditingController();
  final _signupEmailController = TextEditingController();
  final _signupPhoneController = TextEditingController();
  final _signupPasswordController = TextEditingController();
  final _signupConfirmController = TextEditingController();

  bool _showSignup = false;
  bool _loginBusy = false;
  bool _signupBusy = false;
  bool _showLoginPassword = false;
  bool _showSignupPassword = false;
  bool _showSignupConfirmPassword = false;

  @override
  void dispose() {
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _signupNameController.dispose();
    _signupEmailController.dispose();
    _signupPhoneController.dispose();
    _signupPasswordController.dispose();
    _signupConfirmController.dispose();
    super.dispose();
  }

  Future<void> _submitLogin() async {
    final session = context.read<SessionController>();
    final messenger = ScaffoldMessenger.of(context);

    setState(() => _loginBusy = true);
    try {
      await session.login(
        email: _loginEmailController.text,
        password: _loginPasswordController.text,
      );
    } on FirebaseAuthException catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text(_firebaseMessage(error))),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text('Login failed: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _loginBusy = false);
      }
    }
  }

  Future<void> _submitSignup() async {
    final session = context.read<SessionController>();
    final messenger = ScaffoldMessenger.of(context);

    final phone = _signupPhoneController.text.replaceAll(RegExp(r'\D'), '');
    if (_signupNameController.text.trim().isEmpty ||
        _signupEmailController.text.trim().isEmpty ||
        phone.length < 10 ||
        _signupPasswordController.text.length < 6) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Name, email, 10-digit phone and 6+ char password are required.'),
        ),
      );
      return;
    }

    if (_signupPasswordController.text != _signupConfirmController.text) {
      messenger.showSnackBar(
        const SnackBar(content: Text('Passwords do not match.')),
      );
      return;
    }

    setState(() => _signupBusy = true);
    try {
      await session.signupCustomer(
        name: _signupNameController.text,
        email: _signupEmailController.text,
        phone: phone,
        password: _signupPasswordController.text,
      );

      messenger.showSnackBar(
        const SnackBar(content: Text('Account created successfully.')),
      );
    } on FirebaseAuthException catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text(_firebaseMessage(error))),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text('Signup failed: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _signupBusy = false);
      }
    }
  }

  Future<void> _showForgotPasswordDialog() async {
    final controller = TextEditingController(text: _loginEmailController.text.trim());
    final session = context.read<SessionController>();
    final messenger = ScaffoldMessenger.of(context);

    final email = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset password'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Email address',
            hintText: 'you@example.com',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(controller.text.trim()),
            child: const Text('Send Link'),
          ),
        ],
      ),
    );

    if (email == null || email.isEmpty) return;

    try {
      await session.sendPasswordReset(email);
      messenger.showSnackBar(
        const SnackBar(content: Text('Password reset email sent.')),
      );
    } on FirebaseAuthException catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text(_firebaseMessage(error))),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text('Unable to send reset email: $error')),
      );
    }
  }

  String _firebaseMessage(FirebaseAuthException error) {
    switch (error.code) {
      case 'invalid-credential':
      case 'wrong-password':
        return 'Invalid email or password.';
      case 'user-not-found':
        return 'No account found with this email.';
      case 'email-already-in-use':
        return 'This email is already registered.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return error.message ?? 'Authentication error occurred.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF04101A),
              Color(0xFF072032),
              Color(0xFF0D3149),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  const BrandLogo(
                    size: 92,
                    padding: 14,
                    backgroundColor: Color(0x1A38BDF8),
                  ),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'Flutter Mobile Workspace',
                      style: TextStyle(
                        color: Color(0xFF7DD3FC),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    AppConfig.appName,
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Login, notifications, internet awareness aur core permissions ke saath SolutionHub ka dedicated mobile app.',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.white70,
                          height: 1.45,
                        ),
                  ),
                  const SizedBox(height: 22),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      _InfoChip(
                        icon: Icons.notifications_active_outlined,
                        label: 'In-app alerts',
                      ),
                      _InfoChip(
                        icon: Icons.signal_cellular_alt_rounded,
                        label: 'Connectivity aware',
                      ),
                      _InfoChip(
                        icon: Icons.admin_panel_settings_outlined,
                        label: 'Role-based access',
                      ),
                    ],
                  ),
                  const SizedBox(height: 26),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(22),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF071420),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: _TogglePill(
                                    label: 'Login',
                                    selected: !_showSignup,
                                    onTap: () => setState(() => _showSignup = false),
                                  ),
                                ),
                                Expanded(
                                  child: _TogglePill(
                                    label: 'Customer Signup',
                                    selected: _showSignup,
                                    onTap: () => setState(() => _showSignup = true),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 22),
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 220),
                            child: _showSignup
                                ? _buildSignupForm(context)
                                : _buildLoginForm(context),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Employee aur admin users login tab se sign in kar sakte hain. New signup mobile app me customer account create karta hai.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white54,
                          height: 1.45,
                        ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    AppConfig.firebaseSetupHint,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white38,
                          height: 1.5,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm(BuildContext context) {
    return Column(
      key: const ValueKey('login-form'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Use your existing SolutionHub account to continue.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white70,
              ),
        ),
        const SizedBox(height: 20),
        TextField(
          controller: _loginEmailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Email',
            prefixIcon: Icon(Icons.mail_outline_rounded),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _loginPasswordController,
          obscureText: !_showLoginPassword,
          decoration: InputDecoration(
            labelText: 'Password',
            prefixIcon: const Icon(Icons.lock_outline_rounded),
            suffixIcon: IconButton(
              onPressed: () {
                setState(() => _showLoginPassword = !_showLoginPassword);
              },
              icon: Icon(
                _showLoginPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: _showForgotPasswordDialog,
            child: const Text('Forgot password?'),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            onPressed: _loginBusy ? null : _submitLogin,
            icon: _loginBusy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.login_rounded),
            label: Text(_loginBusy ? 'Signing in...' : 'Sign in'),
          ),
        ),
      ],
    );
  }

  Widget _buildSignupForm(BuildContext context) {
    return Column(
      key: const ValueKey('signup-form'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Create customer account',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Phone, internet and alerts ke saath mobile-ready onboarding.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white70,
              ),
        ),
        const SizedBox(height: 20),
        TextField(
          controller: _signupNameController,
          decoration: const InputDecoration(
            labelText: 'Full name',
            prefixIcon: Icon(Icons.person_outline_rounded),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _signupEmailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Email',
            prefixIcon: Icon(Icons.mail_outline_rounded),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _signupPhoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'Phone number',
            prefixIcon: Icon(Icons.phone_outlined),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _signupPasswordController,
          obscureText: !_showSignupPassword,
          decoration: InputDecoration(
            labelText: 'Password',
            prefixIcon: const Icon(Icons.lock_outline_rounded),
            suffixIcon: IconButton(
              onPressed: () {
                setState(() => _showSignupPassword = !_showSignupPassword);
              },
              icon: Icon(
                _showSignupPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _signupConfirmController,
          obscureText: !_showSignupConfirmPassword,
          decoration: InputDecoration(
            labelText: 'Confirm password',
            prefixIcon: const Icon(Icons.verified_user_outlined),
            suffixIcon: IconButton(
              onPressed: () {
                setState(
                  () => _showSignupConfirmPassword = !_showSignupConfirmPassword,
                );
              },
              icon: Icon(
                _showSignupConfirmPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            onPressed: _signupBusy ? null : _submitSignup,
            icon: _signupBusy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.person_add_alt_1_rounded),
            label: Text(_signupBusy ? 'Creating account...' : 'Create account'),
          ),
        ),
      ],
    );
  }
}

class _TogglePill extends StatelessWidget {
  const _TogglePill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF0EA5E9) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: selected ? Colors.white : Colors.white70,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: const Color(0xFF38BDF8)),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
