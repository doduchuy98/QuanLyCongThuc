import React, { useState, useEffect } from 'react';
import { WifiOff, Database } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { UnitConverterModal } from './components/UnitConverterModal';
import { useOffline } from './hooks/useOffline';

import { HomeView } from './views/HomeView';
import { RecipesView } from './views/RecipesView';
import { RecipeDetailView } from './views/RecipeDetailView';
import { AddEditRecipeView } from './views/AddEditRecipeView';
import { IngredientsView } from './views/IngredientsView';
import { AddIngredientView } from './views/AddIngredientView';
import { CategoriesView } from './views/CategoriesView';
import { SettingsView } from './views/SettingsView';
import { ShoppingListView } from './views/ShoppingListView';

import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangePinModal } from './components/ChangePinModal';
import { BatchAddShoppingModal } from './components/BatchAddShoppingModal';

import { INITIAL_RECIPES, INITIAL_INGREDIENTS, INITIAL_CATEGORIES, INITIAL_SHOPPING_LIST } from './data/mockData';
import { ActiveTab, Category, IngredientItem, Recipe, ShoppingListItem } from './types';

export default function App() {
  const { isOffline } = useOffline();

  // Admin Permission State (Default false for public guests on Vercel)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('app_is_admin') === 'true';
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    const saved = localStorage.getItem('app_admin_pin');
    if (!saved || saved === '1234') return '1004';
    return saved;
  });

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [selectedRecipeCategory, setSelectedRecipeCategory] = useState<string>('Tất cả');
  const [selectedIngredientCategory, setSelectedIngredientCategory] = useState<string>('Tất cả');

  const handleAdminLogin = (inputPin: string): boolean => {
    if (inputPin === adminPin) {
      setIsAdmin(true);
      localStorage.setItem('app_is_admin', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('app_is_admin');
  };

  const handleChangeAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('app_admin_pin', newPin);
  };

  // Persistence state
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('app_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [ingredients, setIngredients] = useState<IngredientItem[]>(() => {
    const saved = localStorage.getItem('app_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('app_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    const saved = localStorage.getItem('app_shopping_list');
    return saved ? JSON.parse(saved) : INITIAL_SHOPPING_LIST;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('app_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('app_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('app_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('app_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [subView, setSubView] = useState<'none' | 'recipe_detail' | 'add_recipe' | 'edit_recipe' | 'add_ingredient' | 'edit_ingredient'>('none');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
  const [isBatchAddShoppingModalOpen, setIsBatchAddShoppingModalOpen] = useState(false);

  // Shopping List Handlers
  const handleToggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBought: !item.isBought } : item))
    );
  };

  const handleUpdateShoppingItemAmount = (id: string, delta: number) => {
    setShoppingList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newAmount = Math.max(0.1, Math.round((item.amount + delta) * 10) / 10);
          return { ...item, amount: newAmount };
        }
        return item;
      })
    );
  };

  const handleAddShoppingItem = (newItem: Omit<ShoppingListItem, 'id' | 'createdAt'>) => {
    const created: ShoppingListItem = {
      ...newItem,
      id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setShoppingList((prev) => [created, ...prev]);
  };

  const handleAddBatchShoppingItems = (items: Omit<ShoppingListItem, 'id' | 'createdAt'>[]) => {
    setShoppingList((prev) => {
      const nextList = [...prev];

      items.forEach((item) => {
        // Check if item with same name & unit exists (unbought)
        const existingIndex = nextList.findIndex(
          (ex) =>
            ex.name.toLowerCase().trim() === item.name.toLowerCase().trim() &&
            ex.unit.toLowerCase().trim() === item.unit.toLowerCase().trim() &&
            !ex.isBought
        );

        if (existingIndex >= 0) {
          // Merge amount
          const existing = nextList[existingIndex];
          nextList[existingIndex] = {
            ...existing,
            amount: Math.round((existing.amount + item.amount) * 10) / 10,
            recipeSource: existing.recipeSource
              ? Array.from(new Set([...existing.recipeSource.split(', '), ...(item.recipeSource ? item.recipeSource.split(', ') : [])])).join(', ')
              : item.recipeSource,
          };
        } else {
          // Append new item
          nextList.unshift({
            ...item,
            id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            createdAt: new Date().toLocaleDateString('vi-VN'),
          });
        }
      });

      return nextList;
    });
  };

  const handleAddRecipeToShoppingList = (recipe: Recipe, servings: number) => {
    const getBaseServings = (portionLabel?: string): number => {
      if (!portionLabel) return 1;
      const match = portionLabel.match(/(\d+(\.\d+)?)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0) return val;
      }
      return 1;
    };

    const baseServings = getBaseServings(recipe.portionLabel);
    const multiplier = servings / baseServings;

    const itemsToAdd: Omit<ShoppingListItem, 'id' | 'createdAt'>[] = recipe.ingredients.map((ing) => {
      const matchingGlobalIng = ingredients.find(
        (gi) => gi.id === ing.ingredientId || gi.name.toLowerCase() === ing.ingredientName.toLowerCase()
      );

      return {
        ingredientId: ing.ingredientId || matchingGlobalIng?.id,
        name: ing.ingredientName,
        amount: Math.round((ing.amount || 0) * multiplier * 10) / 10,
        unit: ing.unit,
        category: matchingGlobalIng?.category || 'Rau củ & Thực phẩm',
        pricePerUnit: ing.pricePerUnit ?? matchingGlobalIng?.pricePerUnit ?? 0,
        isBought: false,
        recipeSource: `${recipe.title} (${servings} phần)`,
      };
    });

    handleAddBatchShoppingItems(itemsToAdd);
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearBoughtShoppingItems = () => {
    setShoppingList((prev) => prev.filter((i) => !i.isBought));
  };

  const handleClearAllShoppingItems = () => {
    setShoppingList([]);
  };

  // Navigation Handlers
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSubView('none');
    setSelectedRecipeId(null);
    setSelectedIngredient(null);
  };

  const handleSelectRecipe = (id: string) => {
    setSelectedRecipeId(id);
    setSubView('recipe_detail');
  };

  const handleStartAddRecipe = () => {
    setSelectedRecipeId(null);
    setSubView('add_recipe');
  };

  const handleStartEditRecipe = (id: string) => {
    setSelectedRecipeId(id);
    setSubView('edit_recipe');
  };

  const handleStartAddIngredient = () => {
    setSelectedIngredient(null);
    setSubView('add_ingredient');
  };

  const handleSelectIngredientToEdit = (ing: IngredientItem) => {
    setSelectedIngredient(ing);
    setSubView('edit_ingredient');
  };

  // Data Mutation Handlers
  const handleSaveRecipe = (savedRecipe: Recipe) => {
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === savedRecipe.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRecipe.id ? savedRecipe : r));
      }
      return [savedRecipe, ...prev];
    });

    // Navigate to recipe detail or recipes list
    setSelectedRecipeId(savedRecipe.id);
    setSubView('recipe_detail');
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (selectedRecipeId === recipeId) {
      setSubView('none');
      setActiveTab('recipes');
    }
  };

  const handleSaveIngredient = (savedIngredient: IngredientItem) => {
    setIngredients((prev) => {
      const exists = prev.some((i) => i.id === savedIngredient.id);
      if (exists) {
        return prev.map((i) => (i.id === savedIngredient.id ? savedIngredient : i));
      }
      return [savedIngredient, ...prev];
    });

    setSubView('none');
    setActiveTab('ingredients');
  };

  const handleDeleteIngredient = (ingId: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== ingId));
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const handleResetData = () => {
    setRecipes(INITIAL_RECIPES);
    setIngredients(INITIAL_INGREDIENTS);
    setCategories(INITIAL_CATEGORIES);
    localStorage.clear();
    setSubView('none');
    setActiveTab('home');
  };

  const handleImportData = (data: { recipes: Recipe[]; ingredients: IngredientItem[]; categories: Category[] }) => {
    setRecipes(data.recipes);
    setIngredients(data.ingredients);
    setCategories(data.categories);
    setSubView('none');
    setActiveTab('home');
  };

  // Determine Title & Header Actions
  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const unboughtCount = shoppingList.filter((i) => !i.isBought).length;

  let headerTitle = 'Trang chủ';
  let showBack = false;

  if (subView === 'recipe_detail') {
    headerTitle = 'Chi tiết công thức';
    showBack = true;
  } else if (subView === 'add_recipe') {
    headerTitle = 'Thêm công thức';
    showBack = true;
  } else if (subView === 'edit_recipe') {
    headerTitle = 'Chỉnh sửa công thức';
    showBack = true;
  } else if (subView === 'add_ingredient') {
    headerTitle = 'Thêm nguyên liệu';
    showBack = true;
  } else if (subView === 'edit_ingredient') {
    headerTitle = 'Sửa nguyên liệu';
    showBack = true;
  } else {
    switch (activeTab) {
      case 'home':
        headerTitle = 'Trang chủ';
        break;
      case 'recipes':
        headerTitle = 'Công thức';
        break;
      case 'shopping_list':
        headerTitle = 'Đi chợ thông minh';
        break;
      case 'ingredients':
        headerTitle = 'Danh sách nguyên liệu';
        break;
      case 'categories':
        headerTitle = 'Danh mục';
        break;
      case 'settings':
        headerTitle = 'Cài đặt';
        break;
    }
  }

  return (
    <div className="min-h-dvh bg-slate-100 flex justify-center items-center p-0 md:p-4 lg:p-6 selection:bg-pink-200">
      {/* Container: Mobile centered max-w-[430px], Desktop up to 1280px wide with Sidebar */}
      <div className="relative w-full max-w-[430px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl min-h-dvh md:min-h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)] bg-[#FFF8FB] shadow-2xl flex flex-col md:flex-row md:rounded-3xl md:border md:border-pink-100/80 overflow-hidden">
        {/* Desktop Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          recipesCount={recipes.length}
          ingredientsCount={ingredients.length}
          categoriesCount={categories.length}
          shoppingListUnboughtCount={unboughtCount}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onLogoutAdmin={handleAdminLogout}
          onQuickAddClick={() => setIsQuickAddOpen(true)}
          onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          {/* Header */}
          <Header
            title={headerTitle}
            showBack={showBack}
            onBack={() => {
              if (subView !== 'none') {
                setSubView('none');
              }
            }}
            showBell={activeTab === 'home' && subView === 'none'}
            showScale={true}
            onScaleClick={() => setIsUnitConverterOpen(true)}
            isAdmin={isAdmin}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onLogoutAdmin={handleAdminLogout}
          />

          {/* Offline Notice Banner */}
          {isOffline && (
            <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in z-30 shadow-xs">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span>Đang ở chế độ Ngoại tuyến (Offline). Tất cả công thức & Chế độ nấu ăn vẫn hoạt động!</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-600/60 px-2 py-0.5 rounded-full text-[10px] flex-shrink-0">
                <Database className="w-3 h-3" />
                <span>Cached</span>
              </div>
            </div>
          )}

          {/* Main View Scroll Area */}
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {subView === 'recipe_detail' && selectedRecipe ? (
              <RecipeDetailView
                recipe={selectedRecipe}
                allIngredients={ingredients}
                isAdmin={isAdmin}
                onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                onEditRecipe={(id) => {
                  if (isAdmin) {
                    handleStartEditRecipe(id);
                  } else {
                    setIsAdminLoginOpen(true);
                  }
                }}
                onUpdateRecipe={handleSaveRecipe}
                onAddRecipeToShoppingList={handleAddRecipeToShoppingList}
                onBack={() => setSubView('none')}
              />
            ) : subView === 'add_recipe' ? (
              <AddEditRecipeView
                categories={categories}
                availableIngredients={ingredients}
                onSave={handleSaveRecipe}
                onCancel={() => setSubView('none')}
              />
            ) : subView === 'edit_recipe' && selectedRecipe ? (
              <AddEditRecipeView
                recipeToEdit={selectedRecipe}
                categories={categories}
                availableIngredients={ingredients}
                onSave={handleSaveRecipe}
                onCancel={() => setSubView('recipe_detail')}
              />
            ) : subView === 'add_ingredient' ? (
              <AddIngredientView
                ingredientCategories={categories.filter((c) => c.type === 'ingredient')}
                onSave={handleSaveIngredient}
                onCancel={() => setSubView('none')}
              />
            ) : subView === 'edit_ingredient' && selectedIngredient ? (
              <AddIngredientView
                ingredientToEdit={selectedIngredient}
                ingredientCategories={categories.filter((c) => c.type === 'ingredient')}
                onSave={handleSaveIngredient}
                onCancel={() => setSubView('none')}
              />
            ) : (
              <>
                {activeTab === 'home' && (
                  <HomeView
                    recipes={recipes}
                    categories={categories}
                    totalIngredientsCount={ingredients.length}
                    shoppingListUnboughtCount={unboughtCount}
                    onNavigateToRecipes={() => handleTabChange('recipes')}
                    onNavigateToIngredients={() => handleTabChange('ingredients')}
                    onNavigateToCategories={() => handleTabChange('categories')}
                    onNavigateToShoppingList={() => handleTabChange('shopping_list')}
                    onSelectRecipe={handleSelectRecipe}
                  />
                )}

                {activeTab === 'recipes' && (
                  <RecipesView
                    recipes={recipes}
                    categories={categories}
                    selectedCategory={selectedRecipeCategory}
                    onSelectCategory={setSelectedRecipeCategory}
                    allIngredients={ingredients}
                    isAdmin={isAdmin}
                    onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                    onSelectRecipe={handleSelectRecipe}
                    onAddRecipe={handleStartAddRecipe}
                    onEditRecipe={handleStartEditRecipe}
                    onDeleteRecipe={handleDeleteRecipe}
                  />
                )}

                {activeTab === 'shopping_list' && (
                  <ShoppingListView
                    shoppingList={shoppingList}
                    allIngredients={ingredients}
                    onToggleItem={handleToggleShoppingItem}
                    onUpdateAmount={handleUpdateShoppingItemAmount}
                    onAddItem={handleAddShoppingItem}
                    onDeleteItem={handleDeleteShoppingItem}
                    onClearBought={handleClearBoughtShoppingItems}
                    onClearAll={handleClearAllShoppingItems}
                    onOpenBatchAddRecipeModal={() => setIsBatchAddShoppingModalOpen(true)}
                  />
                )}

                {activeTab === 'ingredients' && (
                  <IngredientsView
                    ingredients={ingredients}
                    categories={categories}
                    selectedCategory={selectedIngredientCategory}
                    onSelectCategory={setSelectedIngredientCategory}
                    isAdmin={isAdmin}
                    onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                    onAddIngredient={handleStartAddIngredient}
                    onSelectIngredient={handleSelectIngredientToEdit}
                    onDeleteIngredient={handleDeleteIngredient}
                  />
                )}

                {activeTab === 'categories' && (
                  <CategoriesView
                    categories={categories}
                    recipes={recipes}
                    ingredients={ingredients}
                    isAdmin={isAdmin}
                    onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                    onSelectCategoryFilter={(catName, catType) => {
                      if (catType === 'ingredient') {
                        setSelectedIngredientCategory(catName);
                        setActiveTab('ingredients');
                      } else {
                        setSelectedRecipeCategory(catName);
                        setActiveTab('recipes');
                      }
                    }}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    recipes={recipes}
                    ingredients={ingredients}
                    categories={categories}
                    isAdmin={isAdmin}
                    onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                    onLogoutAdmin={handleAdminLogout}
                    onOpenChangePin={() => setIsChangePinOpen(true)}
                    onResetData={handleResetData}
                    onImportData={handleImportData}
                  />
                )}
              </>
            )}
          </main>
        </div>

        {/* Mobile Bottom Navigation (Hidden on desktop) */}
        <div className="md:hidden">
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isAdmin={isAdmin}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onQuickAddClick={() => setIsQuickAddOpen(true)}
            shoppingListUnboughtCount={unboughtCount}
          />
        </div>

        {/* Quick Add Bottom Sheet Modal */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onAddRecipe={handleStartAddRecipe}
          onAddIngredient={handleStartAddIngredient}
          onAddCategory={() => {
            setActiveTab('categories');
            setSubView('none');
          }}
          onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
          onOpenSettings={() => {
            setActiveTab('settings');
            setSubView('none');
          }}
        />

        {/* Unit Converter Tool Modal */}
        <UnitConverterModal
          isOpen={isUnitConverterOpen}
          onClose={() => setIsUnitConverterOpen(false)}
        />

        {/* Batch Add Recipe Ingredients to Shopping List Modal */}
        <BatchAddShoppingModal
          isOpen={isBatchAddShoppingModalOpen}
          onClose={() => setIsBatchAddShoppingModalOpen(false)}
          recipes={recipes}
          allIngredients={ingredients}
          onBatchAdd={handleAddBatchShoppingItems}
        />

        {/* Admin PIN Login Modal */}
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLogin={handleAdminLogin}
        />

        {/* Change Admin PIN Modal */}
        <ChangePinModal
          isOpen={isChangePinOpen}
          onClose={() => setIsChangePinOpen(false)}
          currentPin={adminPin}
          onChangePin={handleChangeAdminPin}
        />
      </div>
    </div>
  );
}
