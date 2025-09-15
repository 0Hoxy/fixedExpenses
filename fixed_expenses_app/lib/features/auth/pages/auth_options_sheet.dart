import 'package:flutter/material.dart';
import 'email_auth_sheet.dart';

class AuthOptionsSheet extends StatelessWidget {
  const AuthOptionsSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        bottom: 16 + MediaQuery.of(context).viewInsets.bottom,
        top: 8,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('로그인 또는 가입', style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          _AuthButton(
            background: Colors.black,
            foreground: Colors.white,
            icon: Icons.apple,
            label: 'Apple로 계속',
            onPressed: () {},
          ),
          const SizedBox(height: 12),
          _AuthButton(
            background: Colors.white,
            foreground: Colors.black,
            border: BorderSide(color: scheme.outlineVariant),
            icon: Icons.g_mobiledata_rounded,
            label: 'Google로 계속',
            onPressed: () {},
          ),
          const SizedBox(height: 12),
          _AuthButton(
            background: Colors.white,
            foreground: Colors.black,
            border: BorderSide(color: scheme.outlineVariant),
            icon: Icons.mail_outline_rounded,
            label: '이메일로 계속',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const EmailAuthSheet(asPage: true)),
              );
            },
          ),
          const SizedBox(height: 8),
          Text(
            '계속 진행하면 이용약관 및 개인정보처리방침에 동의합니다',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

class _AuthButton extends StatelessWidget {
  final Color background;
  final Color foreground;
  final BorderSide? border;
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const _AuthButton({
    required this.background,
    required this.foreground,
    this.border,
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          foregroundColor: foreground,
          backgroundColor: background,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
            side: border ?? BorderSide.none,
          ),
        ),
        onPressed: onPressed,
        icon: Icon(icon, size: 22),
        label: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
      ),
    );
  }
}


