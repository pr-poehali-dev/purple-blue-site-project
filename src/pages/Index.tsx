import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
}

interface PageContent {
  text: string;
  imageUrl: string;
  versionName?: string;
}

const Index = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'viewCopies' | null>(null);
  const [showCopiesDialog, setShowCopiesDialog] = useState(false);
  const [allCopies, setAllCopies] = useState<Array<{id: string, text: string, imageUrl: string, versionName?: string}>>([]);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingVersionName, setEditingVersionName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('linear-gradient(to bottom right, #d4d4d4, #c4c4c4, #e0e0e0)');
  
  const colorPalette = [
    { name: 'Красный', hsl: '0 84% 60%' },
    { name: 'Розовый', hsl: '330 81% 60%' },
    { name: 'Фуксия', hsl: '300 76% 58%' },
    { name: 'Фиолетовый', hsl: '270 70% 60%' },
    { name: 'Индиго', hsl: '240 70% 60%' },
    { name: 'Синий', hsl: '210 80% 55%' },
    { name: 'Голубой', hsl: '190 80% 50%' },
    { name: 'Циан', hsl: '180 70% 50%' },
    { name: 'Бирюзовый', hsl: '170 70% 45%' },
    { name: 'Зелёный', hsl: '120 60% 45%' },
    { name: 'Лаймовый', hsl: '90 60% 50%' },
    { name: 'Кислотно-зелёный', hsl: '75 90% 55%' },
    { name: 'Светло-жёлтый', hsl: '55 95% 65%' },
    { name: 'Жёлтый', hsl: '45 100% 55%' },
    { name: 'Янтарный', hsl: '38 92% 50%' },
    { name: 'Оранжевый', hsl: '25 95% 53%' },
    { name: 'Коралловый', hsl: '15 85% 60%' },
    { name: 'Золотой', hsl: '43 74% 49%' },
    { name: 'Бронзовый', hsl: '30 60% 40%' },
    { name: 'Коричневый', hsl: '25 45% 35%' },
    { name: 'Серебряный', hsl: '0 0% 75%' },
    { name: 'Серый', hsl: '0 0% 50%' },
    { name: 'Тёмно-серый', hsl: '0 0% 30%' },
    { name: 'Чёрный', hsl: '0 0% 10%' },
    { name: 'Белый', hsl: '0 0% 95%' },
    { name: 'Лавандовый', hsl: '260 60% 70%' },
    { name: 'Мятный', hsl: '150 60% 60%' },
    { name: 'Персиковый', hsl: '20 80% 70%' },
    { name: 'Сливовый', hsl: '285 55% 45%' },
    { name: 'Бордовый', hsl: '350 60% 35%' }
  ];
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [content, setContent] = useState<PageContent>({
    text: 'Загрузка...',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&h=800&fit=crop'
  });
  const [isLoading, setIsLoading] = useState(true);

  const [editedText, setEditedText] = useState(content.text);
  const [editedImageUrl, setEditedImageUrl] = useState(content.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageId] = useState(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        const response = await fetch(
          `https://functions.poehali.dev/ab23f550-3a81-4f44-8342-4f6d35ed8de4?pageId=${encodeURIComponent(pageId)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          const localData = localStorage.getItem(`page-content-${pageId}`);
          if (localData) {
            const localContent = JSON.parse(localData);
            setContent(localContent);
            setEditedText(localContent.text);
            setEditedImageUrl(localContent.imageUrl);
          } else {
            setContent(data.content);
            setEditedText(data.content.text);
            setEditedImageUrl(data.content.imageUrl);
            localStorage.setItem(`page-content-${pageId}`, JSON.stringify(data.content));
          }
        } else {
          const localData = localStorage.getItem(`page-content-${pageId}`);
          if (localData) {
            const localContent = JSON.parse(localData);
            setContent(localContent);
            setEditedText(localContent.text);
            setEditedImageUrl(localContent.imageUrl);
          } else {
            setContent({
              text: 'Добро пожаловать! Нажмите кнопку редактирования, введите пароль и измените этот текст.',
              imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'
            });
            setEditedText('Добро пожаловать! Нажмите кнопку редактирования, введите пароль и измените этот текст.');
            setEditedImageUrl('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d');
          }
        }
      } catch (error) {
        const localData = localStorage.getItem(`page-content-${pageId}`);
        if (localData) {
          const localContent = JSON.parse(localData);
          setContent(localContent);
          setEditedText(localContent.text);
          setEditedImageUrl(localContent.imageUrl);
        } else {
          setContent({
            text: 'Добро пожаловать! Нажмите кнопку редактирования, введите пароль и измените этот текст.',
            imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&h=800&fit=crop'
          });
          setEditedText('Добро пожаловать! Нажмите кнопку редактирования, введите пароль и измените этот текст.');
          setEditedImageUrl('https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&h=800&fit=crop');
        }
      }
      setIsLoading(false);
    };

    loadPageContent();
  }, [pageId]);

  const createNewCopy = () => {
    const newId = `?copy=${Date.now()}`;
    const currentContent = {
      text: content.text,
      imageUrl: content.imageUrl,
      versionName: `Версия ${new Date().toLocaleString('ru-RU')}`
    };
    localStorage.setItem(`page-content-${newId}`, JSON.stringify(currentContent));
    loadAllCopies();
  };

  const loadAllCopies = () => {
    if (!isAuthenticated) {
      setPendingAction('viewCopies');
      setShowPasswordDialog(true);
      return;
    }
    const copies: Array<{id: string, text: string, imageUrl: string, versionName?: string}> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('page-content-')) {
        const pageId = key.replace('page-content-', '');
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        copies.push({
          id: pageId,
          text: data.text?.substring(0, 50) + (data.text?.length > 50 ? '...' : ''),
          imageUrl: data.imageUrl,
          versionName: data.versionName
        });
      }
    }
    setAllCopies(copies);
    setShowCopiesDialog(true);
  };

  const deleteCopy = (copyId: string) => {
    localStorage.removeItem(`page-content-${copyId}`);
    loadAllCopies();
  };

  const handleVersionNameEdit = (copyId: string, currentName?: string) => {
    setEditingVersionId(copyId);
    setEditingVersionName(currentName || '');
  };

  const saveVersionName = (copyId: string) => {
    const key = `page-content-${copyId}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    data.versionName = editingVersionName.trim() || undefined;
    localStorage.setItem(key, JSON.stringify(data));
    setEditingVersionId(null);
    setEditingVersionName('');
    loadAllCopies();
  };

  useEffect(() => {
    const initialBubbles: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 60 + Math.random() * 140,
      color: i % 3 === 0 ? 'rgba(239, 68, 68, 0.25)' : i % 3 === 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(185, 28, 28, 0.3)',
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
    setBubbles(initialBubbles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) =>
        prev.map((bubble) => {
          let newX = bubble.x + bubble.vx;
          let newY = bubble.y + bubble.vy;
          let newVx = bubble.vx;
          let newVy = bubble.vy;

          if (newX <= 0 || newX >= window.innerWidth - bubble.size) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(window.innerWidth - bubble.size, newX));
          }
          if (newY <= 0 || newY >= window.innerHeight - bubble.size) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(window.innerHeight - bubble.size, newY));
          }

          return { ...bubble, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      );
    }, 20);

    return () => clearInterval(interval);
  }, []);



  const handleEditClick = () => {
    if (isEditMode) {
      setIsEditMode(false);
      setIsAuthenticated(false);
    } else {
      if (!isAuthenticated) {
        setPendingAction('edit');
        setShowPasswordDialog(true);
      } else {
        setIsEditMode(true);
      }
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '210212251277') {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      setPasswordInput('');
      
      if (pendingAction === 'edit') {
        setIsEditMode(true);
      } else if (pendingAction === 'viewCopies') {
        loadAllCopies();
      } else if (pendingAction === 'changeColor') {
        setShowColorPicker(true);
      }
      setPendingAction(null);
    } else {
      alert('Неверный пароль');
      setPasswordInput('');
    }
  };
  
  const hslToRgba = (hsl: string, alpha: number) => {
    const [h, s, l] = hsl.split(' ').map((v, i) => 
      i === 0 ? parseFloat(v) : parseFloat(v.replace('%', '')) / 100
    );
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
    return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${alpha})`;
  };

  const adjustHue = (hsl: string, shift: number) => {
    const [h, s, l] = hsl.split(' ');
    const newH = (parseFloat(h) + shift) % 360;
    return `${newH} ${s} ${l}`;
  };

  const handleColorChange = (hslColor: string) => {
    document.documentElement.style.setProperty('--primary', hslColor);
    document.documentElement.style.setProperty('--accent', hslColor);
    document.documentElement.style.setProperty('--ring', hslColor);
    localStorage.setItem(`primary-color-${pageId}`, hslColor);
    
    const bgColor1 = hslToRgba(hslColor, 0.08);
    const bgColor2 = hslToRgba(adjustHue(hslColor, 20), 0.05);
    const bgColor3 = hslToRgba(adjustHue(hslColor, -15), 0.1);
    const newBg = `linear-gradient(to bottom right, ${bgColor1}, ${bgColor2}, ${bgColor3})`;
    setBackgroundColor(newBg);
    localStorage.setItem(`background-gradient-${pageId}`, newBg);
    
    const newBubbles = bubbles.map((bubble, i) => {
      if (i % 3 === 0) {
        return { ...bubble, color: hslToRgba(adjustHue(hslColor, -10), 0.25) };
      } else if (i % 3 === 1) {
        return { ...bubble, color: 'rgba(255, 255, 255, 0.15)' };
      } else {
        return { ...bubble, color: hslToRgba(adjustHue(hslColor, 10), 0.3) };
      }
    });
    setBubbles(newBubbles);
    
    setShowColorPicker(false);
  };
  
  const openColorPicker = () => {
    if (!isAuthenticated) {
      setPendingAction('changeColor');
      setShowPasswordDialog(true);
    } else {
      setShowColorPicker(true);
    }
  };
  
  useEffect(() => {
    const savedColor = localStorage.getItem(`primary-color-${pageId}`);
    const savedBg = localStorage.getItem(`background-gradient-${pageId}`);
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
      document.documentElement.style.setProperty('--accent', savedColor);
      document.documentElement.style.setProperty('--ring', savedColor);
    } else {
      const goldColor = '43 74% 49%';
      document.documentElement.style.setProperty('--primary', goldColor);
      document.documentElement.style.setProperty('--accent', goldColor);
      document.documentElement.style.setProperty('--ring', goldColor);
    }
    if (savedBg) {
      setBackgroundColor(savedBg);
    } else {
      const goldBg = 'linear-gradient(to bottom right, rgba(30, 30, 30, 0.95), rgba(40, 40, 40, 0.98), rgba(25, 25, 25, 0.95))';
      setBackgroundColor(goldBg);
    }
  }, [pageId]);
  
  useEffect(() => {
    const savedColor = localStorage.getItem(`primary-color-${pageId}`);
    if (bubbles.length > 0) {
      const newBubbles = bubbles.map((bubble, i) => {
        if (savedColor) {
          if (i % 3 === 0) {
            return { ...bubble, color: hslToRgba(adjustHue(savedColor, -10), 0.25) };
          } else if (i % 3 === 1) {
            return { ...bubble, color: 'rgba(255, 255, 255, 0.15)' };
          } else {
            return { ...bubble, color: hslToRgba(adjustHue(savedColor, 10), 0.3) };
          }
        } else {
          if (i % 2 === 0) {
            return { ...bubble, color: 'rgba(218, 165, 32, 0.3)' };
          } else {
            return { ...bubble, color: 'rgba(0, 0, 0, 0.4)' };
          }
        }
      });
      setBubbles(newBubbles);
    }
  }, [bubbles.length, pageId]);

  const handleSave = async () => {
    const existingData = localStorage.getItem(`page-content-${pageId}`);
    const versionName = existingData ? JSON.parse(existingData).versionName : undefined;
    
    const newContent = {
      text: editedText,
      imageUrl: editedImageUrl,
      versionName: versionName
    };
    setContent(newContent);
    
    localStorage.setItem(`page-content-${pageId}`, JSON.stringify(newContent));
    
    try {
      await fetch('https://functions.poehali.dev/ab23f550-3a81-4f44-8342-4f6d35ed8de4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: pageId,
          content: newContent
        })
      });
    } catch (error) {
      console.error('Failed to save to server:', error);
    }
    
    setIsEditMode(false);
    setIsAuthenticated(false);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: backgroundColor }}
      ref={containerRef}
    >
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full backdrop-blur-3xl transition-all duration-100"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            background: bubble.color,
            filter: 'blur(40px)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      ))}

      <div className="fixed top-4 right-4 z-20 flex gap-2">
        {isAuthenticated && (
          <>
            <Button
              onClick={loadAllCopies}
              variant="outline"
              className="bg-card/80 backdrop-blur-xl"
            >
              <Icon name="List" size={16} className="mr-2" />
              Все копии
            </Button>
            <Button
              onClick={createNewCopy}
              variant="outline"
              className="bg-card/80 backdrop-blur-xl"
            >
              <Icon name="Copy" size={16} className="mr-2" />
              Создать копию
            </Button>
            <Button
              onClick={openColorPicker}
              variant="outline"
              className="bg-card/80 backdrop-blur-xl"
            >
              <Icon name="Palette" size={16} className="mr-2" />
              Цвет
            </Button>
          </>
        )}
        <div className="bg-card/80 backdrop-blur-xl px-4 py-2 rounded-md border border-border/50 text-sm text-card-foreground">
          {pageId === '/' ? 'Основная страница' : `Копия ${pageId.split('=')[1]?.slice(0, 8) || ''}`}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <div className="p-8 space-y-6">
            {isEditMode ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Изображение</label>
                  <div className="flex gap-2">
                    <Input
                      value={editedImageUrl}
                      onChange={(e) => setEditedImageUrl(e.target.value)}
                      className="bg-background/50 flex-1"
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon name="Upload" size={16} className="mr-2" />
                      Выбрать
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setEditedImageUrl(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted/30">
                  <img
                    src={editedImageUrl}
                    alt="Редактируемое изображение"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop';
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted/30">
                <img
                  src={content.imageUrl}
                  alt="Изображение"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop';
                  }}
                />
              </div>
            )}

            {isEditMode ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-8 bg-background/50 text-card-foreground border border-input rounded-md px-3 text-xs"
                placeholder="Введите текст..."
              />
            ) : (
              <p className="text-card-foreground leading-relaxed text-center text-xl font-bold break-words whitespace-normal px-4">
                {content.text}
              </p>
            )}

            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <Button onClick={handleSave} className="flex-1" variant="default">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                  <Button onClick={() => {
                    setIsEditMode(false);
                    setIsAuthenticated(false);
                    setEditedText(content.text);
                    setEditedImageUrl(content.imageUrl);
                  }} variant="outline" className="flex-1">
                    <Icon name="X" size={16} className="mr-2" />
                    Отмена
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={loadAllCopies} className="flex-1" variant="outline">
                    <Icon name="FolderOpen" size={16} className="mr-2" />
                    Все версии
                  </Button>
                  <Button onClick={handleEditClick} className="flex-1" variant="default">
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Введите пароль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Пароль"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handlePasswordSubmit} className="flex-1">
                Войти
              </Button>
              <Button 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordInput('');
                }} 
                variant="outline"
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCopiesDialog} onOpenChange={setShowCopiesDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Все копии страниц</span>
              <Button onClick={createNewCopy} size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                Создать версию
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {allCopies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Нет сохраненных копий</p>
            ) : (
              allCopies.map((copy) => (
                <Card key={copy.id} className="p-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={copy.imageUrl}
                        alt="Превью"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingVersionId === copy.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingVersionName}
                            onChange={(e) => setEditingVersionName(e.target.value)}
                            placeholder="Название версии"
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveVersionName(copy.id);
                              if (e.key === 'Escape') setEditingVersionId(null);
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveVersionName(copy.id)}>
                              Сохранить
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingVersionId(null)}>
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium mb-1">
                            {copy.versionName || (copy.id === '/' ? 'Основная страница' : `Копия ${copy.id.split('=')[1]?.slice(0, 8) || ''}`)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {copy.text}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVersionNameEdit(copy.id, copy.versionName)}
                        title="Переименовать"
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(copy.id, '_blank');
                        }}
                      >
                        <Icon name="ExternalLink" size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Удалить эту копию?')) {
                            deleteCopy(copy.id);
                          }
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Выбрать основной цвет сайта</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-3 p-4">
            {colorPalette.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.hsl)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                title={color.name}
              >
                <div 
                  className="w-12 h-12 rounded-full border-2 border-gray-200 group-hover:scale-110 transition-transform shadow-md"
                  style={{ backgroundColor: `hsl(${color.hsl})` }}
                />
                <span className="text-xs text-gray-600 text-center">{color.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;