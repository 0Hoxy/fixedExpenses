import 'package:flutter/material.dart';
import '../../../shared/services/auth_service.dart';
import '../../../shared/services/token_storage.dart';
import '../../app/app_shell.dart';
import 'email_code_page.dart';

class EmailAuthSheet extends StatefulWidget {
  final bool asPage;
  const EmailAuthSheet({super.key, this.asPage = false});

  @override
  State<EmailAuthSheet> createState() => _EmailAuthSheetState();
}

class _EmailAuthSheetState extends State<EmailAuthSheet> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  final _emailFocus = FocusNode();
  bool _obscure = true;
  bool _loading = false;
  String? _error;
  final _auth = AuthService();
  final _token = TokenStorage();
  bool _emailValid = false;

  @override
  void initState() {
    super.initState();
    _email.addListener(_validateEmailLive);
    // 이메일 필드 자동 포커스 → 소프트 키보드 표시 (email 키보드 레이아웃)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _emailFocus.requestFocus();
    });
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _name.dispose();
    _emailFocus.dispose();
    super.dispose();
  }

  void _validateEmailLive() {
    final v = _email.text;
    final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v);
    if (ok != _emailValid) setState(() => _emailValid = ok);
  }

  Widget _buildFormContent(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final screenW = MediaQuery.of(context).size.width;
    final titleSize = (screenW * 0.08).clamp(22.0, 30.0);
    final List<Widget> children = <Widget>[];

    if (widget.asPage) {
      // 상단 타이틀
      children.add(Text('이메일로 계속하기',
          style: Theme.of(context)
              .textTheme
              .headlineSmall
              ?.copyWith(fontWeight: FontWeight.w700, fontSize: titleSize)));
      children.add(const SizedBox(height: 20));
    }

    if (_error != null) {
      children.add(Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: scheme.errorContainer,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(_error!, style: TextStyle(color: scheme.onErrorContainer)),
      ));
    }

    children.add(TextFormField(
      controller: _email,
      focusNode: _emailFocus,
      autofocus: true,
      decoration: const InputDecoration(
        hintText: 'you@example.com',
        border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(14))),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: Color(0xFFE0E0E0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(width: 2.5),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      ),
      keyboardType: TextInputType.emailAddress,
      textCapitalization: TextCapitalization.none,
      enableSuggestions: false,
      autocorrect: false,
      autofillHints: const [AutofillHints.username, AutofillHints.email],
      style: const TextStyle(fontSize: 18),
      validator: (v) {
        if (v == null || v.isEmpty) return '이메일을 입력하세요';
        final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v);
        return ok ? null : '올바른 이메일 형식이 아닙니다';
      },
    ));

    children.add(const SizedBox(height: 12));
    children.add(const SizedBox(height: 16));
    if (!widget.asPage) {
      children.add(SizedBox(
        height: 52,
        child: FilledButton(
          onPressed: (_loading || !_emailValid) ? null : _submit,
          child: _loading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('계속하기'),
        ),
      ));
      children.add(const SizedBox(height: 8));
    }

    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: children,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final width = media.size.width;
    final height = media.size.height;
    final edge = (width * 0.07).clamp(24.0, 28.0);
    final topPad = (height * 0.03).clamp(12.0, 28.0) + media.viewPadding.top * 0.4;
    final content = _buildFormContent(context);
    if (widget.asPage) {
      final bottom = SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 8, 16, 16 + media.viewInsets.bottom),
          child: SizedBox(
            height: 52,
            child: FilledButton(
              onPressed: (_loading || !_emailValid) ? null : _goToCode,
              child: _loading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('계속하기'),
            ),
          ),
        ),
      );

      return Scaffold(
        resizeToAvoidBottomInset: true,
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
            ),
          ),
        ),
        bottomNavigationBar: bottom,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.only(
              left: edge,
              right: edge,
              bottom: 16 + MediaQuery.of(context).viewInsets.bottom,
              top: topPad,
            ),
            child: content,
          ),
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.only(
        left: edge,
        right: edge,
        bottom: 16 + MediaQuery.of(context).viewInsets.bottom,
        top: topPad,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          content,
          const SizedBox(height: 8),
          SizedBox(
            height: 52,
            child: FilledButton(
              onPressed: (_loading || !_emailValid) ? null : _goToCode,
              child: _loading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('계속하기'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      // 이메일만으로 시작 → 서버 정책에 맞춰 다음 단계로 확장 가능
      // 현재는 이메일/비밀번호 없이 로그인 단계 예시를 유지하려면 아래 로직을 바꾸세요.
      // 여기서는 이메일만 검증 후 AppShell로 이동하는 형태로 남겨둡니다.
      // 실제 구현 시에는 magic link 또는 비밀번호 입력 단계를 추가하세요.
      final token = await _auth.login(email: _email.text, password: '');
      await _token.saveToken(token);
      if (!mounted) return;
      Navigator.of(context).pop();
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const AppShell()));
    } catch (e) {
      setState(() => _error = '실패: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _goToCode() async {
    // 실제 구현 시, 여기서 서버에 코드 전송 요청
    try {
      await _auth.requestEmailCode(email: _email.text);
    } catch (_) {}
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => EmailCodePage(email: _email.text)),
    );
  }
}


