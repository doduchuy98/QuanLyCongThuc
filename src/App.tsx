import React, { useState, useEffect } from 'react';
import { WifiOff, Database } from 'lucide-react';
import { Header } from './components/Header';
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

import { INITIAL_RECIPES, INITIAL_INGREDIENTS, INITIAL_CATEGORIES } from './data/mockData';
import { ActiveTab, Category, IngredientItem, Recipe } from './types';

export default function App() {
  const { isOffline } = useOffline();

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

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [subView, setSubView] = useState<'none' | 'recipe_detail' | 'add_recipe' | 'edit_recipe' | 'add_ingredient' | 'edit_ingredient'>('none');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);

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
    <div className="min-h-dvh bg-slate-100 flex justify-center items-start selection:bg-pink-200">
      {/* Mobile-First Container (max-width: 430px, background: white/soft pink) */}
      <div className="relative w-full max-w-[430px] min-h-dvh bg-[#FFF8FB] shadow-2xl flex flex-col justify-between overflow-x-hidden border-x border-slate-200/50">
        {/* Sticky Header */}
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
          showEdit={subView === 'recipe_detail'}
          onEditClick={() => {
            if (selectedRecipeId) {
              setSubView('edit_recipe');
            }
          }}
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

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {subView === 'recipe_detail' && selectedRecipe ? (
            <RecipeDetailView
              recipe={selectedRecipe}
              onEditRecipe={handleStartEditRecipe}
              onUpdateRecipe={handleSaveRecipe}
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
                  onNavigateToRecipes={() => handleTabChange('recipes')}
                  onNavigateToIngredients={() => handleTabChange('ingredients')}
                  onNavigateToCategories={() => handleTabChange('categories')}
                  onSelectRecipe={handleSelectRecipe}
                />
              )}

              {activeTab === 'recipes' && (
                <RecipesView
                  recipes={recipes}
                  categories={categories}
                  onSelectRecipe={handleSelectRecipe}
                  onAddRecipe={handleStartAddRecipe}
                  onEditRecipe={handleStartEditRecipe}
                  onDeleteRecipe={handleDeleteRecipe}
                />
              )}

              {activeTab === 'ingredients' && (
                <IngredientsView
                  ingredients={ingredients}
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
                  onSelectCategoryFilter={(catName) => {
                    setActiveTab('recipes');
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
                  onResetData={handleResetData}
                  onImportData={handleImportData}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onQuickAddClick={() => setIsQuickAddOpen(true)}
        />

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
      </div>
    </div>
  );
}
