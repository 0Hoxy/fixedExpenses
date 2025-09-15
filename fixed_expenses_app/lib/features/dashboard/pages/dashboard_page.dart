import 'package:flutter/material.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('대시보드')),
      body: const Center(
        child: Text('대시보드 스켈레톤 — 추후 구성 예정'),
      ),
    );
  }
}


