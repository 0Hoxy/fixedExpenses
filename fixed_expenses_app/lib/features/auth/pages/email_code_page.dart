import 'package:flutter/material.dart';
import '../../../shared/services/auth_service.dart';
import '../../app/app_shell.dart';

class EmailCodePage extends StatefulWidget {
  final String email;
  const EmailCodePage({super.key, required this.email});

  @override
  State<EmailCodePage> createState() => _EmailCodePageState();
}

class _EmailCodePageState extends State<EmailCodePage> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());
  bool _loading = false;
  String? _error;
  final _auth = AuthService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _focusNodes.first.requestFocus());
    for (final f in _focusNodes) {
      f.addListener(() => setState(() {}));
    }
    for (final c in _controllers) {
      c.addListener(() => setState(() {}));
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  String get _code => _controllers.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_code.length != 6) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    await Future.delayed(const Duration(milliseconds: 200));
    if (!mounted) return;
    final ok = true; // 하드코딩: 임시로 항상 성공 처리
    if (ok) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const AppShell()),
        (route) => false,
      );
    } else {
      setState(() => _error = '코드가 올바르지 않습니다');
    }
    if (mounted) setState(() => _loading = false);
  }

  void _onChanged(int index, String value) {
    if (value.length == 1 && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    if (_code.length == 6) {
      _verify();
    }
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final width = media.size.width;
    final hPad = (width * 0.07).clamp(24.0, 28.0);
    final titleSize = (width * 0.08).clamp(22.0, 30.0);

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        leadingWidth: 52,
        leading: Padding(
          padding: const EdgeInsets.only(left: 12),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.of(context).maybePop(),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints.tightFor(width: 40, height: 40),
            splashRadius: 22,
            style: IconButton.styleFrom(shape: const CircleBorder()),
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(hPad, 8, hPad, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('이메일 확인', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700, fontSize: titleSize)),
              const SizedBox(height: 8),
              Text('${widget.email}으로 보내드린 \n4자리 확인 코드를 입력해 주세요.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 16)),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) {
                  const gap = 8.0; // desired gap between cells
                  final gaps = 5 * gap; // 6 cells -> 5 gaps
                  final cellWidth = ((width - hPad * 2 - gaps) / 6);
                  final cellHeight = (cellWidth * 1.6).clamp(64.0, 110.0);
                  final fontSize = (cellWidth * 0.48).clamp(20.0, 28.0);
                  final vPad = (cellHeight * 0.32).clamp(16.0, 36.0);
                  return SizedBox(
                    width: cellWidth,
                    height: cellHeight,
                    child: TextField(
                      controller: _controllers[i],
                      focusNode: _focusNodes[i],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      style: TextStyle(fontSize: fontSize, fontWeight: FontWeight.w900, letterSpacing: 1.0),
                      decoration: InputDecoration(
                        counterText: '',
                        border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: const BorderRadius.all(Radius.circular(16)),
                          borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
                        ),
                        focusedBorder: const OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(16)),
                          borderSide: BorderSide(width: 3),
                        ),
                        contentPadding: EdgeInsets.symmetric(vertical: vPad),
                      ),
                      onChanged: (v) => _onChanged(i, v),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text('인증번호를 다시 받으시겠습니까? ',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 16)),
                  TextButton(
                    onPressed: () async {
                      try {
                        await _auth.requestEmailCode(email: widget.email);
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            behavior: SnackBarBehavior.floating,
                            margin: EdgeInsets.only(top: 12, left: 12, right: 12),
                            content: Text('인증번호를 다시 보냈습니다.'),
                          ),
                        );
                      } catch (_) {}
                    },
                    child: const Text('재발급하기'),
                  )
                ],
              ),
              const SizedBox(height: 12),
              if (_error != null)
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              // 하단 확인 버튼 제거: 6자리 입력 시 자동 검증
            ],
          ),
        ),
      ),
    );
  }
}


