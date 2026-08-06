import React, { useState, useEffect } from 'react';
import { WifiOff, Database, ShieldAlert, Lock, UserCheck, Settings as SettingsIcon } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { useOffline } from './hooks/useOffline';

import { HomeView } from './views/HomeView';
import { RecipesView } from './views/RecipesView';
import { RecipeDetailView } from './views/RecipeDetailView';
import { AddEditRecipeView } from './views/AddEditRecipeView';
import { IngredientsView } from './views/IngredientsView';
import { AddIngredientView } from './views/AddIngredientView';
import { SettingsView } from './views/SettingsView';
import { BrowserView } from './views/BrowserView';
import { CategoriesView } from './views/CategoriesView';

import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangePinModal } from './components/ChangePinModal';
import { BatchAddShoppingModal } from './components/BatchAddShoppingModal';
import { NotificationModal } from './components/NotificationModal';
import { FinanceAuthModal } from './components/FinanceAuthModal';

import { INITIAL_RECIPES, INITIAL_INGREDIENTS, INITIAL_CATEGORIES, INITIAL_SHOPPING_LIST, INITIAL_EXPENSES } from './data/mockData';
import { ActiveTab, Category, IngredientItem, Recipe, ShoppingListItem, AppMode, ExpenseItem, AppNotification, FinanceUser } from './types';
import { ExpenseTrackerView } from './views/ExpenseTrackerView';
import {
  seedCollectionIfEmpty,
  subscribeCollection,
  syncSaveDoc,
  syncDeleteDoc,
  syncBatchSave,
  syncReplaceCollection,
} from './services/firestoreSync';

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

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [subView, setSubView] = useState<'none' | 'recipe_detail' | 'add_recipe' | 'edit_recipe' | 'add_ingredient' | 'edit_ingredient'>('none');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [adminNoticeMsg, setAdminNoticeMsg] = useState<string | null>(null);
  const [pendingAdminTab, setPendingAdminTab] = useState<ActiveTab | null>(null);
  const [selectedRecipeCategory, setSelectedRecipeCategory] = useState<string>('Tất cả');
  const [selectedIngredientCategory, setSelectedIngredientCategory] = useState<string>('Tất cả');

  const handleAdminLogin = (inputPin: string): boolean => {
    if (inputPin === adminPin) {
      setIsAdmin(true);
      localStorage.setItem('app_is_admin', 'true');
      if (pendingAdminTab) {
        setActiveTab(pendingAdminTab);
        setSubView('none');
        setSelectedRecipeId(null);
        setSelectedIngredient(null);
        setPendingAdminTab(null);
      }
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('app_is_admin');
    setAppMode('kitchen');
  };

  const handleChangeAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('app_admin_pin', newPin);
  };

  // App Mode State: 'kitchen' (Quản lý Bếp) or 'finance' (Quản lý Chi tiêu Cá nhân)
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('app_mode');
    return (saved as AppMode) || 'kitchen';
  });

  const handleToggleAppMode = () => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setAppMode((prev) => {
      const nextMode = prev === 'kitchen' ? 'finance' : 'kitchen';
      localStorage.setItem('app_mode', nextMode);
      return nextMode;
    });
  };

  // Guard: If not admin, force mode back to kitchen and reset admin-only tabs
  useEffect(() => {
    if (!isAdmin) {
      if (appMode === 'finance') {
        setAppMode('kitchen');
      }
      if (activeTab === 'browser' || activeTab === 'settings') {
        setActiveTab('home');
      }
    }
  }, [isAdmin, appMode, activeTab]);

  // Finance Accounts Management
  const DEFAULT_FINANCE_USERS: FinanceUser[] = [
    {
      id: 'usr-hudode',
      username: 'hudode',
      name: 'Đỗ Đức Huy',
      pin: '1004',
      avatarBg: '#FF8FB8',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-demo',
      username: 'taikhoan_demo',
      name: 'Tài Khoản Demo',
      pin: '1234',
      avatarBg: '#60A5FA',
      createdAt: new Date().toISOString(),
    },
  ];

  const [financeUsers, setFinanceUsers] = useState<FinanceUser[]>(() => {
    const saved = localStorage.getItem('app_finance_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_FINANCE_USERS;
  });

  const [currentFinanceUser, setCurrentFinanceUser] = useState<FinanceUser | null>(() => {
    const saved = localStorage.getItem('app_current_finance_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_FINANCE_USERS[0];
  });

  const [isFinanceAuthModalOpen, setIsFinanceAuthModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_finance_users', JSON.stringify(financeUsers));
  }, [financeUsers]);

  useEffect(() => {
    if (currentFinanceUser) {
      localStorage.setItem('app_current_finance_user', JSON.stringify(currentFinanceUser));
    } else {
      localStorage.removeItem('app_current_finance_user');
    }
  }, [currentFinanceUser]);

  // Expenses State (Isolated Per Account)
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    if (currentFinanceUser) {
      const key = `app_expenses_${currentFinanceUser.username}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
      if (currentFinanceUser.username === 'hudode') {
        const oldSaved = localStorage.getItem('app_expenses');
        if (oldSaved) {
          try {
            const parsed = JSON.parse(oldSaved);
            localStorage.setItem(key, oldSaved);
            return parsed;
          } catch (e) {}
        }
      }
      return [];
    }
    return [];
  });

  // Load & subscribe account-specific expenses when current user changes
  useEffect(() => {
    if (!currentFinanceUser) {
      setExpenses([]);
      return;
    }

    const key = `app_expenses_${currentFinanceUser.username}`;
    const userCol = `expenses_${currentFinanceUser.username}`;

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        setExpenses([]);
      }
    } else if (currentFinanceUser.username === 'hudode') {
      const oldSaved = localStorage.getItem('app_expenses');
      if (oldSaved) {
        try {
          const parsed = JSON.parse(oldSaved);
          setExpenses(parsed);
          localStorage.setItem(key, oldSaved);
        } catch (e) {
          setExpenses([]);
        }
      } else {
        setExpenses([]);
      }
    } else {
      setExpenses([]);
    }

    // Subscribe to Firestore collection for this specific user
    const unsub = subscribeCollection<ExpenseItem>(
      userCol,
      (remoteExp) => {
        if (!remoteExp) return;
        const sorted = [...remoteExp].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(sorted);
        localStorage.setItem(key, JSON.stringify(sorted));
      }
    );

    return () => {
      unsub();
    };
  }, [currentFinanceUser?.username]);

  // Save expenses per account
  useEffect(() => {
    if (currentFinanceUser) {
      const key = `app_expenses_${currentFinanceUser.username}`;
      localStorage.setItem(key, JSON.stringify(expenses));
    }
  }, [expenses, currentFinanceUser?.username]);

  const handleAddExpense = (newItem: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    if (!currentFinanceUser) {
      setIsFinanceAuthModalOpen(true);
      return;
    }
    const item: ExpenseItem = {
      ...newItem,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [item, ...prev]);
    syncSaveDoc(`expenses_${currentFinanceUser.username}`, item);
  };

  const handleDeleteExpense = (id: string) => {
    if (!currentFinanceUser) return;
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    syncDeleteDoc(`expenses_${currentFinanceUser.username}`, id);
  };

  const handleUpdateExpense = (updatedItem: ExpenseItem) => {
    if (!currentFinanceUser) return;
    setExpenses((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    syncSaveDoc(`expenses_${currentFinanceUser.username}`, updatedItem);
  };

  const handleExportFinanceData = () => {
    if (!expenses || expenses.length === 0) {
      alert('Chưa có dữ liệu thu chi nào để sao lưu!');
      return;
    }
    const data = {
      version: '1.0',
      type: 'SoTayThuChi_Backup',
      user: currentFinanceUser?.username || 'guest',
      userName: currentFinanceUser?.name || 'Cá nhân',
      exportedAt: new Date().toISOString(),
      expenses,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const userTag = currentFinanceUser?.username ? `_${currentFinanceUser.username}` : '';
    a.download = `sotay_thuchi_backup${userTag}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFinanceData = (importedItems: ExpenseItem[], mode: 'merge' | 'replace') => {
    if (!currentFinanceUser) return;

    if (mode === 'replace') {
      setExpenses(importedItems);
    } else {
      setExpenses((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newUnique = importedItems.filter((i) => !existingIds.has(i.id));
        return [...newUnique, ...prev];
      });
    }

    importedItems.forEach((item) => {
      syncSaveDoc(`expenses_${currentFinanceUser.username}`, item);
    });
  };

  const handleFinanceLogin = (user: FinanceUser, inputPin: string): boolean => {
    if (user.pin === inputPin) {
      setCurrentFinanceUser(user);
      setIsFinanceAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const handleCreateFinanceAccount = (
    newUser: Omit<FinanceUser, 'id' | 'createdAt'>
  ): boolean => {
    const created: FinanceUser = {
      ...newUser,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFinanceUsers((prev) => [...prev, created]);
    setCurrentFinanceUser(created);
    setIsFinanceAuthModalOpen(false);
    return true;
  };

  const handleLogoutFinanceUser = () => {
    setCurrentFinanceUser(null);
    setExpenses([]);
  };

  const handleDeleteFinanceAccount = (userId: string) => {
    setFinanceUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentFinanceUser?.id === userId) {
      setCurrentFinanceUser(null);
      setExpenses([]);
    }
  };

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('app_mode', appMode);
  }, [appMode]);

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

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('app_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return [
      {
        id: 'notif_welcome',
        type: 'system',
        title: 'Chào mừng bạn đến với Quản lý Công thức!',
        message: 'Hệ thống hỗ trợ lưu trữ công thức, định lượng nguyên liệu và lịch sử hoạt động.',
        timestamp: 'Hôm nay',
        isRead: false,
      },
      {
        id: 'notif_update_app',
        type: 'system',
        title: 'Cập nhật hệ thống',
        message: 'Chuông thông báo tự động ghi nhận mọi hoạt động thêm, sửa, xóa công thức & nguyên liệu.',
        timestamp: 'Hôm nay',
        isRead: false,
      },
    ];
  });

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (
    type: AppNotification['type'],
    title: string,
    message: string,
    recipeId?: string
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      type,
      title,
      message,
      timestamp: `${timeStr} • ${dateStr}`,
      isRead: false,
      recipeId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Firestore Real-Time Cloud Sync (Online mode)
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let unsubs: (() => void)[] = [];

    const initSync = async () => {
      // 1. Get saved local data if present
      const savedRecipesStr = localStorage.getItem('app_recipes');
      const localRecipes: Recipe[] = savedRecipesStr ? JSON.parse(savedRecipesStr) : INITIAL_RECIPES;

      const savedIngsStr = localStorage.getItem('app_ingredients');
      const localIngs: IngredientItem[] = savedIngsStr ? JSON.parse(savedIngsStr) : INITIAL_INGREDIENTS;

      const savedCatsStr = localStorage.getItem('app_categories');
      const localCats: Category[] = savedCatsStr ? JSON.parse(savedCatsStr) : INITIAL_CATEGORIES;

      const savedShopStr = localStorage.getItem('app_shopping_list');
      const localShop: ShoppingListItem[] = savedShopStr ? JSON.parse(savedShopStr) : INITIAL_SHOPPING_LIST;

      // 2. Seed initial data if Firestore collections are empty (preferring user local storage data)
      await Promise.all([
        seedCollectionIfEmpty('recipes', localRecipes),
        seedCollectionIfEmpty('ingredients', localIngs),
        seedCollectionIfEmpty('categories', localCats),
        seedCollectionIfEmpty('shoppingList', localShop),
      ]);

      if (!isMounted) return;

      // 3. Subscribe to real-time updates from Firestore
      unsubs.push(
        subscribeCollection<Recipe>(
          'recipes',
          (remoteRecipes) => {
            if (!isMounted || !remoteRecipes) return;
            setRecipes(remoteRecipes);
            setIsCloudSynced(true);
          },
          () => setIsCloudSynced(false)
        )
      );

      unsubs.push(
        subscribeCollection<IngredientItem>(
          'ingredients',
          (remoteIngs) => {
            if (!isMounted || !remoteIngs) return;
            setIngredients(remoteIngs);
            setIsCloudSynced(true);
          },
          () => setIsCloudSynced(false)
        )
      );

      unsubs.push(
        subscribeCollection<Category>(
          'categories',
          (remoteCats) => {
            if (!isMounted || !remoteCats) return;
            setCategories(remoteCats);
            setIsCloudSynced(true);
          },
          () => setIsCloudSynced(false)
        )
      );

      unsubs.push(
        subscribeCollection<ShoppingListItem>(
          'shoppingList',
          (remoteShop) => {
            if (!isMounted || !remoteShop) return;
            setShoppingList(remoteShop);
            setIsCloudSynced(true);
          },
          () => setIsCloudSynced(false)
        )
      );
    };

    initSync();

    return () => {
      isMounted = false;
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBatchAddShoppingModalOpen, setIsBatchAddShoppingModalOpen] = useState(false);

  // Shopping List Handlers
  const handleToggleShoppingItem = (id: string) => {
    setShoppingList((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, isBought: !item.isBought };
          syncSaveDoc('shoppingList', updated);
          return updated;
        }
        return item;
      });
      return next;
    });
  };

  const handleUpdateShoppingItemAmount = (id: string, delta: number) => {
    setShoppingList((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const newAmount = Math.max(0.1, Math.round((item.amount + delta) * 10) / 10);
          const updated = { ...item, amount: newAmount };
          syncSaveDoc('shoppingList', updated);
          return updated;
        }
        return item;
      });
      return next;
    });
  };

  const handleAddShoppingItem = (newItem: Omit<ShoppingListItem, 'id' | 'createdAt'>) => {
    const created: ShoppingListItem = {
      ...newItem,
      id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setShoppingList((prev) => [created, ...prev]);
    syncSaveDoc('shoppingList', created);
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

      syncBatchSave('shoppingList', nextList);
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
    syncDeleteDoc('shoppingList', id);
  };

  const handleClearBoughtShoppingItems = () => {
    shoppingList.filter((i) => i.isBought).forEach((i) => syncDeleteDoc('shoppingList', i.id));
    setShoppingList((prev) => prev.filter((i) => !i.isBought));
  };

  const handleClearAllShoppingItems = () => {
    shoppingList.forEach((i) => syncDeleteDoc('shoppingList', i.id));
    setShoppingList([]);
  };

  // Navigation Handlers
  const handleTabChange = (tab: ActiveTab) => {
    if ((tab === 'browser' || tab === 'settings') && !isAdmin) {
      setPendingAdminTab(tab);
      setIsAdminLoginOpen(true);
      return;
    }

    if (tab === 'browser' && !currentFinanceUser) {
      setIsFinanceAuthModalOpen(true);
    }

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
    let isUpdate = false;
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === savedRecipe.id);
      isUpdate = exists;
      if (exists) {
        return prev.map((r) => (r.id === savedRecipe.id ? savedRecipe : r));
      }
      return [savedRecipe, ...prev];
    });
    syncSaveDoc('recipes', savedRecipe);

    if (isUpdate) {
      addNotification(
        'edit',
        'Đã cập nhật công thức',
        `Món "${savedRecipe.title}" vừa được chỉnh sửa thành công.`,
        savedRecipe.id
      );
    } else {
      addNotification(
        'add',
        'Thêm công thức mới',
        `Món "${savedRecipe.title}" vừa được thêm vào danh sách.`,
        savedRecipe.id
      );
    }

    // Navigate to recipe detail or recipes list
    setSelectedRecipeId(savedRecipe.id);
    setSubView('recipe_detail');
  };

  const handleDeleteRecipe = (recipeId: string) => {
    const target = recipes.find((r) => r.id === recipeId);
    const title = target ? target.title : 'Công thức';
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    syncDeleteDoc('recipes', recipeId);

    addNotification('delete', 'Đã xóa công thức', `Món "${title}" đã được xóa khỏi danh sách.`);

    if (selectedRecipeId === recipeId) {
      setSubView('none');
      setActiveTab('recipes');
    }
  };

  const handleSaveIngredient = (savedIngredient: IngredientItem) => {
    let isUpdate = false;
    setIngredients((prev) => {
      const exists = prev.some((i) => i.id === savedIngredient.id);
      isUpdate = exists;
      if (exists) {
        return prev.map((i) => (i.id === savedIngredient.id ? savedIngredient : i));
      }
      return [savedIngredient, ...prev];
    });
    syncSaveDoc('ingredients', savedIngredient);

    if (isUpdate) {
      addNotification('edit', 'Cập nhật nguyên liệu', `Nguyên liệu "${savedIngredient.name}" đã được cập nhật.`);
    } else {
      addNotification('add', 'Thêm nguyên liệu mới', `Nguyên liệu "${savedIngredient.name}" vừa được tạo.`);
    }

    setSubView('none');
    setActiveTab('ingredients');
  };

  const handleDeleteIngredient = (ingId: string) => {
    const target = ingredients.find((i) => i.id === ingId);
    const name = target ? target.name : 'Nguyên liệu';
    setIngredients((prev) => prev.filter((i) => i.id !== ingId));
    syncDeleteDoc('ingredients', ingId);

    addNotification('delete', 'Đã xóa nguyên liệu', `Nguyên liệu "${name}" đã được xóa.`);
  };

  const handleUpdateIngredientPrice = (ingId: string, newPrice: number | undefined) => {
    setIngredients((prev) => {
      const updated = prev.map((i) => (i.id === ingId ? { ...i, pricePerUnit: newPrice } : i));
      const target = updated.find((i) => i.id === ingId);
      if (target) {
        syncSaveDoc('ingredients', target);
      }
      return updated;
    });
  };

  const handleBatchAddMissingIngredients = (newIngs: IngredientItem[]) => {
    setIngredients((prev) => {
      const filteredNew = newIngs.filter(
        (ni) => !prev.some((p) => p.name.trim().toLowerCase() === ni.name.trim().toLowerCase())
      );
      if (filteredNew.length === 0) return prev;
      filteredNew.forEach((item) => syncSaveDoc('ingredients', item));
      return [...filteredNew, ...prev];
    });
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    syncSaveDoc('categories', newCat);
    addNotification('add', 'Thêm danh mục', `Danh mục "${newCat.name}" vừa được tạo thành công.`);
  };

  const handleUpdateCategory = (updatedCat: Category, oldName?: string) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
    syncSaveDoc('categories', updatedCat);

    if (oldName && oldName !== updatedCat.name) {
      if (updatedCat.type === 'recipe' || (!updatedCat.type && updatedCat.type !== 'ingredient' && updatedCat.type !== 'unit')) {
        setRecipes((prev) => {
          const next = prev.map((r) => (r.category === oldName ? { ...r, category: updatedCat.name } : r));
          next.forEach((r) => {
            if (r.category === updatedCat.name) syncSaveDoc('recipes', r);
          });
          return next;
        });
      } else if (updatedCat.type === 'ingredient') {
        setIngredients((prev) => {
          const next = prev.map((i) => (i.category === oldName ? { ...i, category: updatedCat.name } : i));
          next.forEach((i) => {
            if (i.category === updatedCat.name) syncSaveDoc('ingredients', i);
          });
          return next;
        });
      }
    }

    addNotification('edit', 'Cập nhật danh mục', `Danh mục "${updatedCat.name}" đã được cập nhật.`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const target = categories.find((c) => c.id === categoryId);
    const name = target ? target.name : 'Danh mục';
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    syncDeleteDoc('categories', categoryId);
    addNotification('delete', 'Đã xóa danh mục', `Danh mục "${name}" đã được xóa khỏi hệ thống.`);
  };

  const handleResetData = () => {
    setRecipes(INITIAL_RECIPES);
    setIngredients(INITIAL_INGREDIENTS);
    setCategories(INITIAL_CATEGORIES);
    setShoppingList(INITIAL_SHOPPING_LIST);
    setExpenses([]);
    syncReplaceCollection('recipes', INITIAL_RECIPES);
    syncReplaceCollection('ingredients', INITIAL_INGREDIENTS);
    syncReplaceCollection('categories', INITIAL_CATEGORIES);
    syncReplaceCollection('shoppingList', INITIAL_SHOPPING_LIST);
    if (currentFinanceUser) {
      syncReplaceCollection(`expenses_${currentFinanceUser.username}`, []);
    } else {
      syncReplaceCollection('expenses', []);
    }
    localStorage.clear();
    setSubView('none');
    setActiveTab('home');
  };

  const handleClearExpenseData = () => {
    setExpenses([]);
    if (currentFinanceUser) {
      const userCol = `expenses_${currentFinanceUser.username}`;
      const key = `app_expenses_${currentFinanceUser.username}`;
      syncReplaceCollection(userCol, []);
      localStorage.removeItem(key);
    } else {
      syncReplaceCollection('expenses', []);
      localStorage.removeItem('app_expenses');
    }
    localStorage.removeItem('app_lending_balance');
  };

  const handleImportData = (data: { recipes: Recipe[]; ingredients: IngredientItem[]; categories: Category[] }) => {
    setRecipes(data.recipes);
    setIngredients(data.ingredients);
    setCategories(data.categories);
    syncReplaceCollection('recipes', data.recipes);
    syncReplaceCollection('ingredients', data.ingredients);
    syncReplaceCollection('categories', data.categories);
    setSubView('none');
    setActiveTab('home');
  };

  // Determine Title & Header Actions
  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const unboughtCount = shoppingList.filter((i) => !i.isBought).length;

  let headerTitle = 'Trang chủ';
  let showBack = false;

  if (isAdmin && appMode === 'finance' && subView === 'none') {
    headerTitle = 'Quản lý Chi tiêu';
  } else if (subView === 'recipe_detail') {
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
      case 'browser':
        headerTitle = 'Thu/Chi';
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
          onOpenUnitConverter={() => handleTabChange('ingredients')}
          appMode={appMode}
          onToggleAppMode={handleToggleAppMode}
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
            onBellClick={() => setIsNotificationModalOpen(true)}
            unreadCount={notifications.filter((n) => !n.isRead).length}
            showScale={true}
            onScaleClick={() => handleTabChange('ingredients')}
            isAdmin={isAdmin}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onLogoutAdmin={handleAdminLogout}
            isCloudSynced={isCloudSynced}
            appMode={appMode}
            onToggleAppMode={handleToggleAppMode}
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
            {isAdmin && appMode === 'finance' && subView === 'none' ? (
              currentFinanceUser ? (
                <ExpenseTrackerView
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onSwitchMode={setAppMode}
                  currentUser={currentFinanceUser}
                  onOpenFinanceAuth={() => setIsFinanceAuthModalOpen(true)}
                  onExportFinanceData={handleExportFinanceData}
                  onImportFinanceData={handleImportFinanceData}
                />
              ) : (
                <div className="p-8 max-w-md mx-auto text-center space-y-4 my-12 animate-fade-in bg-white rounded-3xl border border-pink-100 shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Yêu cầu Đăng nhập Thu Chi</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Đăng nhập tài khoản cá nhân để xem và quản lý sổ chi tiêu riêng biệt của bạn.
                    </p>
                  </div>
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => setIsFinanceAuthModalOpen(true)}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Đăng nhập hoặc Tạo tài khoản</span>
                    </button>
                  </div>
                </div>
              )
            ) : subView === 'recipe_detail' && selectedRecipe ? (
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
                onSaveIngredient={handleSaveIngredient}
                onAddCategory={handleAddCategory}
                onCancel={() => setSubView('none')}
              />
            ) : subView === 'edit_recipe' && selectedRecipe ? (
              <AddEditRecipeView
                recipeToEdit={selectedRecipe}
                categories={categories}
                availableIngredients={ingredients}
                onSave={handleSaveRecipe}
                onSaveIngredient={handleSaveIngredient}
                onAddCategory={handleAddCategory}
                onCancel={() => setSubView('recipe_detail')}
              />
            ) : subView === 'add_ingredient' ? (
              <AddIngredientView
                existingIngredients={ingredients}
                ingredientCategories={categories.filter((c) => c.type === 'ingredient')}
                unitCategories={categories.filter((c) => c.type === 'unit')}
                onSave={handleSaveIngredient}
                onAddCategory={handleAddCategory}
                onCancel={() => setSubView('none')}
              />
            ) : subView === 'edit_ingredient' && selectedIngredient ? (
              <AddIngredientView
                ingredientToEdit={selectedIngredient}
                existingIngredients={ingredients}
                ingredientCategories={categories.filter((c) => c.type === 'ingredient')}
                unitCategories={categories.filter((c) => c.type === 'unit')}
                onSave={handleSaveIngredient}
                onAddCategory={handleAddCategory}
                onCancel={() => setSubView('none')}
              />
            ) : (
              <>
                {activeTab === 'home' && (
                  <HomeView
                    recipes={recipes}
                    categories={categories}
                    totalIngredientsCount={ingredients.length}
                    onNavigateToRecipes={(catName) => {
                      if (catName) {
                        setSelectedRecipeCategory(catName);
                      }
                      handleTabChange('recipes');
                    }}
                    onNavigateToBrowser={() => handleTabChange('browser')}
                    onSwitchToExpense={() => setAppMode('finance')}
                    onSelectRecipe={handleSelectRecipe}
                    isAdmin={isAdmin}
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
                    onManageCategories={() => handleTabChange('categories')}
                  />
                )}

                {activeTab === 'categories' && (
                  <CategoriesView
                    categories={categories}
                    recipes={recipes}
                    ingredients={ingredients}
                    isAdmin={isAdmin}
                    onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onSelectCategoryFilter={(catName, type) => {
                      if (type === 'recipe') {
                        setSelectedRecipeCategory(catName);
                        handleTabChange('recipes');
                      } else {
                        setSelectedIngredientCategory(catName);
                        handleTabChange('ingredients');
                      }
                    }}
                  />
                )}

                {activeTab === 'browser' && (
                  !isAdmin ? (
                    <div className="p-8 max-w-md mx-auto text-center space-y-4 my-12 animate-fade-in bg-white rounded-3xl border border-pink-100 shadow-sm">
                      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                        <Lock className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-lg">Yêu cầu Quyền Admin</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Chỉ Quản trị viên (Admin) mới có quyền truy cập và quản lý Thu/Chi.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setPendingAdminTab('browser');
                            setIsAdminLoginOpen(true);
                          }}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Đăng nhập Admin (Nhập PIN)</span>
                        </button>
                      </div>
                    </div>
                  ) : currentFinanceUser ? (
                    <ExpenseTrackerView
                      expenses={expenses}
                      onAddExpense={handleAddExpense}
                      onDeleteExpense={handleDeleteExpense}
                      onUpdateExpense={handleUpdateExpense}
                      onSwitchMode={setAppMode}
                      currentUser={currentFinanceUser}
                      onOpenFinanceAuth={() => setIsFinanceAuthModalOpen(true)}
                      onExportFinanceData={handleExportFinanceData}
                      onImportFinanceData={handleImportFinanceData}
                    />
                  ) : (
                    <div className="p-8 max-w-md mx-auto text-center space-y-4 my-12 animate-fade-in bg-white rounded-3xl border border-pink-100 shadow-sm">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                        <Lock className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-lg">Yêu cầu Đăng nhập Thu Chi</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Vui lòng đăng nhập tài khoản cá nhân để xem và quản lý sổ chi tiêu riêng biệt.
                        </p>
                      </div>
                      <div className="pt-2 space-y-2">
                        <button
                          onClick={() => setIsFinanceAuthModalOpen(true)}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Đăng nhập hoặc Tạo tài khoản</span>
                        </button>
                      </div>
                    </div>
                  )
                )}

                {activeTab === 'ingredients' && (
                  <IngredientsView
                    ingredients={ingredients}
                    recipes={recipes}
                    categories={categories}
                    selectedCategory={selectedIngredientCategory}
                    onSelectCategory={setSelectedIngredientCategory}
                    isAdmin={isAdmin}
                    onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                    onAddIngredient={handleStartAddIngredient}
                    onSelectIngredient={handleSelectIngredientToEdit}
                    onDeleteIngredient={handleDeleteIngredient}
                    onUpdateIngredientPrice={handleUpdateIngredientPrice}
                    onBatchAddMissingIngredients={handleBatchAddMissingIngredients}
                  />
                )}

                {activeTab === 'settings' && (
                  !isAdmin ? (
                    <div className="p-8 max-w-md mx-auto text-center space-y-4 my-12 animate-fade-in bg-white rounded-3xl border border-pink-100 shadow-sm">
                      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                        <Lock className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-lg">Yêu cầu Quyền Admin</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Chỉ Quản trị viên (Admin) mới có quyền truy cập Cài đặt hệ thống.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setPendingAdminTab('settings');
                            setIsAdminLoginOpen(true);
                          }}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Đăng nhập Admin (Nhập PIN)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SettingsView
                      recipes={recipes}
                      ingredients={ingredients}
                      categories={categories}
                      expenses={expenses}
                      isAdmin={isAdmin}
                      onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                      onLogoutAdmin={handleAdminLogout}
                      onOpenChangePin={() => setIsChangePinOpen(true)}
                      onResetData={handleResetData}
                      onClearExpenseData={handleClearExpenseData}
                      onImportData={handleImportData}
                      financeUsers={financeUsers}
                      currentFinanceUser={currentFinanceUser}
                      onOpenFinanceAuth={() => setIsFinanceAuthModalOpen(true)}
                      onLogoutFinanceUser={handleLogoutFinanceUser}
                      onDeleteFinanceAccount={handleDeleteFinanceAccount}
                      onExportFinanceData={handleExportFinanceData}
                      onImportFinanceData={handleImportFinanceData}
                    />
                  )
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
          onOpenIngredients={() => {
            setIsQuickAddOpen(false);
            handleTabChange('ingredients');
          }}
          onOpenSettings={() => {
            setIsQuickAddOpen(false);
            handleTabChange('settings');
          }}
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
          onClose={() => {
            setIsAdminLoginOpen(false);
            setPendingAdminTab(null);
          }}
          onLogin={handleAdminLogin}
        />

        {/* Change Admin PIN Modal */}
        <ChangePinModal
          isOpen={isChangePinOpen}
          onClose={() => setIsChangePinOpen(false)}
          currentPin={adminPin}
          onChangePin={handleChangeAdminPin}
        />

        {/* Finance Accounts Login/Register Modal */}
        <FinanceAuthModal
          isOpen={isFinanceAuthModalOpen}
          onClose={() => setIsFinanceAuthModalOpen(false)}
          users={financeUsers}
          currentUser={currentFinanceUser}
          onLogin={handleFinanceLogin}
          onCreateAccount={handleCreateFinanceAccount}
          onNavigateToSettings={() => handleTabChange('settings')}
        />

        {/* Activity Notifications Modal */}
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onMarkAsRead={handleMarkNotificationAsRead}
          onClearAll={handleClearAllNotifications}
          onDeleteNotification={handleDeleteNotification}
          onSelectRecipe={(recipeId) => {
            setSelectedRecipeId(recipeId);
            setSubView('recipe_detail');
          }}
        />

        {/* Admin Access Restriction Notice Modal */}
        {adminNoticeMsg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-rose-100 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Thông Báo Truy Cập</h3>
                <p className="text-xs text-slate-600 font-bold mt-1.5 px-2">
                  {adminNoticeMsg}
                </p>
              </div>
              <button
                onClick={() => setAdminNoticeMsg(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
