import 'package:flutter/material.dart';

class ResponsiveAuthLayout extends StatelessWidget {
  final Widget mobile;
  final Widget tablet;
  final Widget desktop;

  const ResponsiveAuthLayout({
    super.key,
    required this.mobile,
    required this.tablet,
    required this.desktop,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width >= 1024) return desktop;
    if (width >= 600) return tablet;
    return mobile;
  }
}


