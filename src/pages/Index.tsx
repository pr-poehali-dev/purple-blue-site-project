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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [content, setContent] = useState<PageContent>(() => {
    const pageId = window.location.pathname + window.location.search;
    const saved = localStorage.getItem(`page-content-${pageId}`);
    return saved ? JSON.parse(saved) : {
      text: 'Добро пожаловать! Нажмите кнопку редактирования, введите пароль и измените этот текст.',
      imageUrl: 'https://v3b.fal.media/files/b/rabbit/72b7CqeVnreiaWpETPTCk_output.png'
    };
  });

  const [editedText, setEditedText] = useState(content.text);
  const [editedImageUrl, setEditedImageUrl] = useState(content.imageUrl);

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
      setIsEditMode(true);
      setShowPasswordDialog(false);
      setPasswordInput('');
    } else {
      alert('Неверный пароль');
      setPasswordInput('');
    }
  };

  const handleSave = () => {
    const newContent = {
      text: editedText,
      imageUrl: editedImageUrl
    };
    setContent(newContent);
    
    const pageId = window.location.pathname + window.location.search;
    localStorage.setItem(`page-content-${pageId}`, JSON.stringify(newContent));
    
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <div className="p-8 space-y-6">
            {isEditMode ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">URL изображения</label>
                  <Input
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    className="bg-background/50"
                    placeholder="https://example.com/image.jpg"
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
                className="min-h-[120px] bg-background/50 text-card-foreground resize-none"
                placeholder="Введите текст..."
              />
            ) : (
              <p className="text-gray-600 leading-relaxed text-center text-2xl font-semibold tracking-wider">
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
    </div>
  );
};

export default Index;