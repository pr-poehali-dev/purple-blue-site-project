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
}

const Index = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCopiesDialog, setShowCopiesDialog] = useState(false);
  const [allCopies, setAllCopies] = useState<Array<{id: string, text: string, imageUrl: string}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [content, setContent] = useState<PageContent>({
    text: 'Загрузка...',
    imageUrl: '/avatar-icon.svg'
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
              imageUrl: '/avatar-icon.svg'
            });
            setEditedText('Добро пожаловать! Нажмите кнопку редактирования, введите пароль и измените этот текст.');
            setEditedImageUrl('/avatar-icon.svg');
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
            imageUrl: '/avatar-icon.svg'
          });
          setEditedText('Добро пожаловать! Нажмите кнопку редактирования, введите пароль и izmените этот текст.');
          setEditedImageUrl('/avatar-icon.svg');
        }
      }
      setIsLoading(false);
    };

    loadPageContent();
  }, [pageId]);

  const createNewCopy = () => {
    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }
    const newId = `?copy=${Date.now()}`;
    window.open(newId, '_blank');
  };

  const loadAllCopies = () => {
    if (!isAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }
    const copies: Array<{id: string, text: string, imageUrl: string}> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('page-content-')) {
        const pageId = key.replace('page-content-', '');
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        copies.push({
          id: pageId,
          text: data.text?.substring(0, 50) + (data.text?.length > 50 ? '...' : ''),
          imageUrl: data.imageUrl
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

  useEffect(() => {
    const initialBubbles: Bubble[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 80 + Math.random() * 120,
      color: i % 3 === 0 ? 'rgba(239, 68, 68, 0.25)' : i % 3 === 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(185, 28, 28, 0.3)',
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
    setBubbles(initialBubbles);
  }, []);

  useEffect(() => {
    if (draggingId !== null) return;

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
  }, [draggingId]);

  const handleMouseDown = (id: number) => {
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null) return;
    
    setBubbles((prev) =>
      prev.map((bubble) =>
        bubble.id === draggingId
          ? { ...bubble, x: e.clientX - bubble.size / 2, y: e.clientY - bubble.size / 2 }
          : bubble
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleEditClick = () => {
    if (isEditMode) {
      setIsEditMode(false);
      setIsAuthenticated(false);
    } else {
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '210212251277') {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      setPasswordInput('');
      
      if (!isEditMode && !showCopiesDialog) {
        setIsEditMode(true);
      }
    } else {
      alert('Неверный пароль');
      setPasswordInput('');
    }
  };

  const handleSave = async () => {
    const newContent = {
      text: editedText,
      imageUrl: editedImageUrl
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
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#d4d4d4] via-[#c4c4c4] to-[#e0e0e0]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={containerRef}
    >
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full backdrop-blur-3xl transition-all duration-100 cursor-move"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            background: bubble.color,
            filter: 'blur(40px)',
            userSelect: 'none',
          }}
          onMouseDown={() => handleMouseDown(bubble.id)}
        />
      ))}

      <div className="fixed top-4 right-4 z-20 flex gap-2">
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
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[40px] bg-background/50 text-card-foreground resize-none"
                placeholder="Введите текст..."
              />
            ) : (
              <p className="text-gray-600 leading-relaxed text-center text-2xl font-bold break-words whitespace-normal" style={{transform: 'scale(1.3, 1.1)', wordBreak: 'break-word'}}>
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
                <Button onClick={handleEditClick} className="w-full" variant="default">
                  <Icon name="Edit" size={16} className="mr-2" />
                  Редактировать
                </Button>
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
            <DialogTitle>Все копии страниц</DialogTitle>
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
                      <p className="text-sm font-medium mb-1">
                        {copy.id === '/' ? 'Основная страница' : `Копия ${copy.id.split('=')[1]?.slice(0, 8) || ''}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {copy.text}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
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
    </div>
  );
};

export default Index;