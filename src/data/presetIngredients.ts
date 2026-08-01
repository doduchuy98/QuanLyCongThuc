export interface PresetIngredient {
  name: string;
  category: string;
  unit: string;
  imageUrl: string;
  note?: string;
}

export const INITIAL_INGREDIENT_CATEGORIES = [
  {
    id: 'icat-1',
    name: 'Thịt tươi',
    iconName: 'Beef',
    bgColor: '#FFECA8',
    type: 'ingredient' as const,
    recipeCount: 0,
    itemCount: 4,
  },
  {
    id: 'icat-2',
    name: 'Rau củ & Rau thơm',
    iconName: 'Carrot',
    bgColor: '#D9F7BE',
    type: 'ingredient' as const,
    recipeCount: 0,
    itemCount: 5,
  },
  {
    id: 'icat-3',
    name: 'Tinh bột',
    iconName: 'Wheat',
    bgColor: '#FFF0F5',
    type: 'ingredient' as const,
    recipeCount: 0,
    itemCount: 3,
  },
  {
    id: 'icat-4',
    name: 'Gia vị',
    iconName: 'Sparkles',
    bgColor: '#FFD9E8',
    type: 'ingredient' as const,
    recipeCount: 0,
    itemCount: 4,
  },
  {
    id: 'icat-5',
    name: 'Đồ uống & Sữa',
    iconName: 'Milk',
    bgColor: '#AEE9FF',
    type: 'ingredient' as const,
    recipeCount: 0,
    itemCount: 2,
  },
];

export const PRESET_INGREDIENTS_LIBRARY: PresetIngredient[] = [
  // Thịt & Hải sản
  {
    name: 'Thịt bò tái',
    category: 'Thịt tươi',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=200&auto=format&fit=crop&q=80',
    note: 'Thịt thăn bò mềm, xắt mỏng',
  },
  {
    name: 'Thịt heo vai',
    category: 'Thịt tươi',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200&auto=format&fit=crop&q=80',
    note: 'Thịt vai có nạc có mỡ vừa ăn',
  },
  {
    name: 'Ức gà tươi',
    category: 'Thịt tươi',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&auto=format&fit=crop&q=80',
    note: 'Ức gà phi lê không da',
  },
  {
    name: 'Sườn heo',
    category: 'Thịt tươi',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    note: 'Sườn non chặt miếng vừa ăn',
  },
  {
    name: 'Tôm tươi',
    category: 'Thịt tươi',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&auto=format&fit=crop&q=80',
    note: 'Tôm bóc vỏ bỏ chỉ đen',
  },
  {
    name: 'Mực ống',
    category: 'Thịt tươi',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=200&auto=format&fit=crop&q=80',
    note: 'Mực ống tươi làm sạch cắt khoanh',
  },

  // Rau củ & Rau thơm
  {
    name: 'Hành tây',
    category: 'Rau củ & Rau thơm',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=200&auto=format&fit=crop&q=80',
    note: 'Hành tây củ vừa, ngọt thanh',
  },
  {
    name: 'Gừng tươi',
    category: 'Rau củ & Rau thơm',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=80',
    note: 'Gừng già thơm nức',
  },
  {
    name: 'Cà chua',
    category: 'Rau củ & Rau thơm',
    unit: 'quả',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
    note: 'Cà chua chín đỏ mọng',
  },
  {
    name: 'Hành lá',
    category: 'Rau củ & Rau thơm',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=200&auto=format&fit=crop&q=80',
    note: 'Hành lá tươi xắt nhỏ',
  },
  {
    name: 'Tỏi củ',
    category: 'Rau củ & Rau thơm',
    unit: 'tép',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=80',
    note: 'Tỏi băm hoặc đập dập',
  },
  {
    name: 'Sả củ',
    category: 'Rau củ & Rau thơm',
    unit: 'củ',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=80',
    note: 'Sả tươi đập dập hoặc băm nhỏ',
  },

  // Tinh bột
  {
    name: 'Bánh phở',
    category: 'Tinh bột',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&auto=format&fit=crop&q=80',
    note: 'Bánh phở tươi sợi nhỏ',
  },
  {
    name: 'Bún tươi',
    category: 'Tinh bột',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    note: 'Bún tươi mềm dẻo',
  },
  {
    name: 'Bánh mì',
    category: 'Tinh bột',
    unit: 'ổ',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
    note: 'Bánh mì vỏ giòn ruột xốp',
  },
  {
    name: 'Gạo tấm',
    category: 'Tinh bột',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
    note: 'Gạo tấm thơm dẻo',
  },

  // Gia vị
  {
    name: 'Nước mắm',
    category: 'Gia vị',
    unit: 'ml',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80',
    note: 'Nước mắm truyền thống',
  },
  {
    name: 'Đường phèn',
    category: 'Gia vị',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=200&auto=format&fit=crop&q=80',
    note: 'Đường phèn ngọt thanh',
  },
  {
    name: 'Hạt nêm',
    category: 'Gia vị',
    unit: 'muỗng cà phê',
    imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=200&auto=format&fit=crop&q=80',
    note: 'Hạt nêm từ thịt & xương',
  },
  {
    name: 'Dầu ăn',
    category: 'Gia vị',
    unit: 'ml',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80',
    note: 'Dầu thực vật nguyên chất',
  },
  {
    name: 'Nước cốt dừa',
    category: 'Gia vị',
    unit: 'ml',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
    note: 'Nước cốt dừa béo ngậy',
  },

  // Đồ uống & Sữa
  {
    name: 'Sữa đặc',
    category: 'Đồ uống & Sữa',
    unit: 'ml',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
    note: 'Sữa đặc có đường',
  },
  {
    name: 'Trà đen Assam',
    category: 'Đồ uống & Sữa',
    unit: 'gram',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
    note: 'Trà đen nguyên lá đậm đà',
  },
];
