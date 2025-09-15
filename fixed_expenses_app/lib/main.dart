import 'package:flutter/material.dart';
import 'features/auth/pages/welcome_auth_page.dart';

void main() {
  runApp(const FixedExpensesApp());
}

class FixedExpensesApp extends StatelessWidget {
  const FixedExpensesApp({super.key});

  @override
  Widget build(BuildContext context) {
    final base = ThemeData(
      primarySwatch: Colors.blue,
      useMaterial3: true,
      fontFamily: 'Pretendard',
      scaffoldBackgroundColor: Colors.white,
    );

    return MaterialApp(
      title: '고정비 관리 앱',
      theme: base.copyWith(
        textTheme: base.textTheme.copyWith(
          displayLarge: base.textTheme.displayLarge?.copyWith(fontWeight: FontWeight.w700),
          displayMedium: base.textTheme.displayMedium?.copyWith(fontWeight: FontWeight.w700),
          displaySmall: base.textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700),
          headlineLarge: base.textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.w700),
          headlineMedium: base.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
          headlineSmall: base.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
          titleLarge: base.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        ),
        colorScheme: base.colorScheme.copyWith(
          background: Colors.white,
          surface: Colors.white,
        ),
      ),
      debugShowCheckedModeBanner: false,
      home: const WelcomeAuthPage(),
    );
  }
}



