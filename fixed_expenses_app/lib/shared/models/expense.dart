class Expense {
  final String id;
  final String name;
  final int amount;
  final String categoryId;
  final String? categoryName;
  final String? categoryIcon;
  final String? categoryColor;
  final String? description;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Expense({
    required this.id,
    required this.name,
    required this.amount,
    required this.categoryId,
    this.categoryName,
    this.categoryIcon,
    this.categoryColor,
    this.description,
    required this.createdAt,
    this.updatedAt,
  });

  // 카테고리 이름 반환 (백엔드에서 조인된 데이터 또는 기본값)
  String get category => categoryName ?? categoryId;

  // JSON 변환 메서드
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'amount': amount,
      'category_id': categoryId,
      'category_name': categoryName,
      'category_icon': categoryIcon,
      'category_color': categoryColor,
      'description': description,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // JSON에서 객체 생성
  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'],
      name: json['name'],
      amount: json['amount'],
      categoryId: json['category_id'] ?? json['category'],
      categoryName: json['category_name'],
      categoryIcon: json['category_icon'],
      categoryColor: json['category_color'],
      description: json['description'],
      createdAt: DateTime.parse(json['created_at'] ?? json['createdAt']),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at']) 
          : json['updatedAt'] != null 
              ? DateTime.parse(json['updatedAt'])
              : null,
    );
  }

  // 복사본 생성 (수정 시 사용)
  Expense copyWith({
    String? id,
    String? name,
    int? amount,
    String? categoryId,
    String? categoryName,
    String? categoryIcon,
    String? categoryColor,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Expense(
      id: id ?? this.id,
      name: name ?? this.name,
      amount: amount ?? this.amount,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      categoryIcon: categoryIcon ?? this.categoryIcon,
      categoryColor: categoryColor ?? this.categoryColor,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'Expense(id: $id, name: $name, amount: $amount, category: $category)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Expense && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
