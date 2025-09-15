import 'package:flutter/material.dart';

class AuthTitle extends StatelessWidget {
  final String title;
  final String? subtitle;
  const AuthTitle({super.key, required this.title, this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.headlineSmall),
          if (subtitle != null)
            Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Text(subtitle!, style: Theme.of(context).textTheme.bodyMedium),
            ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}


