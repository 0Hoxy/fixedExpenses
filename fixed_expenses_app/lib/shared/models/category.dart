class Category {
  final String id;
  final String name;
  final String icon;
  final String color;

  const Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
  });

  // 기본 카테고리들
  static List<Category> get defaultCategories => [
    const Category(
      id: 'housing',
      name: '주거비',
      icon: '🏠',
      color: '#FF6B6B',
    ),
    const Category(
      id: 'utilities',
      name: '통신비',
      icon: '📱',
      color: '#4ECDC4',
    ),
    const Category(
      id: 'insurance',
      name: '보험',
      icon: '🛡️',
      color: '#45B7D1',
    ),
    const Category(
      id: 'transportation',
      name: '교통비',
      icon: '🚗',
      color: '#96CEB4',
    ),
    const Category(
      id: 'food',
      name: '식비',
      icon: '🍽️',
      color: '#FFEAA7',
    ),
    const Category(
      id: 'healthcare',
      name: '의료비',
      icon: '🏥',
      color: '#DDA0DD',
    ),
    const Category(
      id: 'education',
      name: '교육비',
      icon: '📚',
      color: '#98D8C8',
    ),
    const Category(
      id: 'entertainment',
      name: '엔터테인먼트',
      icon: '🎬',
      color: '#F7DC6F',
    ),
    const Category(
      id: 'other',
      name: '기타',
      icon: '📦',
      color: '#BB8FCE',
    ),
  ];

  // JSON 변환 메서드
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color': color,
    };
  }

  // JSON에서 객체 생성
  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      icon: json['icon'],
      color: json['color'],
    );
  }

  // ID로 카테고리 찾기
  static Category? findById(String id) {
    try {
      return defaultCategories.firstWhere((category) => category.id == id);
    } catch (e) {
      return null;
    }
  }

  @override
  String toString() {
    return 'Category(id: $id, name: $name, icon: $icon)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Category && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
