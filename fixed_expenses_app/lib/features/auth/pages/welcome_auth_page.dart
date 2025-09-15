import 'package:flutter/material.dart';
import '../widgets/auth_scaffold.dart';
import 'auth_options_sheet.dart';
import 'email_auth_sheet.dart';

class WelcomeAuthPage extends StatelessWidget {
  const WelcomeAuthPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final bottomSafe = MediaQuery.of(context).padding.bottom;
    final width = MediaQuery.of(context).size.width;
    return AuthScaffold(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Headline first (above mock phone image)
          const SizedBox(height: 24),
          Text(
            '고정 지출을 쉽게 관리해보세요',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.w900,
                  fontSize: (width * 0.07).clamp(22.0, 28.0),
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),
          // Mock hero phone image placeholder (iPhone portrait ~9:19.5)
          LayoutBuilder(
            builder: (context, constraints) {
              final screenW = MediaQuery.of(context).size.width;
              final boxW = (screenW * 0.82).clamp(0.0, 380.0);
              final boxH = boxW * (19.5 / 9.0);
              return Center(
                child: SizedBox(
                  width: boxW,
                  height: boxH,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.black12, width: 1),
                    ),
                    child: const Center(child: Icon(Icons.smartphone, size: 96, color: Colors.grey)),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 48),
          // Bottom CTA cluster (no Spacer inside scroll view)
          Padding(
            padding: EdgeInsets.only(bottom: 84 + bottomSafe),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      elevation: 0,
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                    ),
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        showDragHandle: true,
                        isScrollControlled: true,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        ),
                        builder: (_) => const AuthOptionsSheet(),
                      );
                    },
                    child: const Text('계속하기', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 24),
                Align(
                  alignment: Alignment.center,
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    children: [
                      Text('이미 계정이 있으신가요? ', style: Theme.of(context).textTheme.bodyMedium),
                      GestureDetector(
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const EmailAuthSheet(asPage: true)),
                        ),
                        child: Text('로그인', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AuthPrimaryButton extends StatelessWidget {
  final Color background;
  final Color foreground;
  final BorderSide? border;
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const _AuthPrimaryButton({
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


