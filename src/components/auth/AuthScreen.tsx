import React, { useRef, useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to merge class names
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};
type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};
const DotMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  // Set up routes that will animate across the map
  const routes: {
    start: RoutePoint;
    end: RoutePoint;
    color: string;
  }[] = [{
    start: {
      x: 100,
      y: 150,
      delay: 0
    },
    end: {
      x: 200,
      y: 80,
      delay: 2
    },
    color: "#2563eb"
  }, {
    start: {
      x: 200,
      y: 80,
      delay: 2
    },
    end: {
      x: 260,
      y: 120,
      delay: 4
    },
    color: "#2563eb"
  }, {
    start: {
      x: 50,
      y: 50,
      delay: 1
    },
    end: {
      x: 150,
      y: 180,
      delay: 3
    },
    color: "#2563eb"
  }, {
    start: {
      x: 280,
      y: 60,
      delay: 0.5
    },
    end: {
      x: 180,
      y: 180,
      delay: 2.5
    },
    color: "#2563eb"
  }];

  // Create dots for the world map
  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1;

    // Create a dot grid pattern with random opacity
    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Shape the dots to form a world map silhouette
        const isInMapShape =
        // North America
        x < width * 0.25 && x > width * 0.05 && y < height * 0.4 && y > height * 0.1 ||
        // South America
        x < width * 0.25 && x > width * 0.15 && y < height * 0.8 && y > height * 0.4 ||
        // Europe
        x < width * 0.45 && x > width * 0.3 && y < height * 0.35 && y > height * 0.15 ||
        // Africa
        x < width * 0.5 && x > width * 0.35 && y < height * 0.65 && y > height * 0.35 ||
        // Asia
        x < width * 0.7 && x > width * 0.45 && y < height * 0.5 && y > height * 0.1 ||
        // Australia
        x < width * 0.8 && x > width * 0.65 && y < height * 0.8 && y > height * 0.6;
        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.2
          });
        }
      }
    }
    return dots;
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(entries => {
      const {
        width,
        height
      } = entries[0].contentRect;
      setDimensions({
        width,
        height
      });
      canvas.width = width;
      canvas.height = height;
    });
    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, []);
  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    // Draw background dots
    function drawDots() {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw the dots
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${dot.opacity})`;
        ctx.fill();
      });
    }

    // Draw animated routes
    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;
      routes.forEach(route => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        // Draw the route line
        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw the start point
        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();

        // Draw the moving point
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();

        // Add glow effect to the moving point
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
        ctx.fill();

        // If the route is complete, draw the end point
        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }

    // Animation loop
    function animate() {
      drawDots();
      drawRoutes();

      // If all routes are complete, restart the animation
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
        startTime = Date.now();
      }
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);
  return <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>;
};
const AuthScreen = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        throw error;
      }
      if (data.user) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro de login:', error);
      if (error.message === 'Invalid login credentials') {
        toast.error('Email ou senha inválidos');
      } else if (error.message === 'Email not confirmed') {
        toast.error('Por favor, confirme seu email antes de fazer login');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="flex w-full h-full items-center justify-center">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.5
      }} className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-white shadow-xl">
          {/* Left side - Map */}
          <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
              <DotMap />
              
              {/* Logo and text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                <motion.div initial={{
                opacity: 0,
                y: -20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.6,
                duration: 0.5
              }} className="mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <ArrowRight className="text-white h-6 w-6" />
                  </div>
                </motion.div>
                <motion.h2 initial={{
                opacity: 0,
                y: -20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.7,
                duration: 0.5
              }} className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  MecânicaPro
                </motion.h2>
                <motion.p initial={{
                opacity: 0,
                y: -20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.8,
                duration: 0.5
              }} className="text-sm text-center text-gray-600 max-w-xs">
                  Faça login para acessar seu painel de gerenciamento.
                </motion.p>
              </div>
            </div>
          </div>
          
          {/* Right side - Sign In Form */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }}>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800">Bem-vindo de volta</h1>
              <p className="text-gray-500 mb-8">Faça login em sua conta</p>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-blue-500">*</span>
                  </label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu email" required className="flex h-10 w-full rounded-md border bg-gray-50 border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha <span className="text-blue-500">*</span>
                  </label>
                  <div className="relative">
                    <input id="password" type={isPasswordVisible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" required className="flex h-10 w-full rounded-md border bg-gray-50 border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10" />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                      {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <motion.div whileHover={{
                scale: 1.01
              }} whileTap={{
                scale: 0.98
              }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} className="pt-2">
                  <button type="submit" disabled={isLoading} className={cn("w-full bg-gradient-to-r relative overflow-hidden from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", isHovered ? "shadow-lg shadow-blue-200" : "")}>
                    <span className="flex items-center justify-center">
                      {isLoading ? 'Entrando...' : 'Entrar'}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </span>
                    {isHovered && !isLoading && <motion.span initial={{
                    left: "-100%"
                  }} animate={{
                    left: "100%"
                  }} transition={{
                    duration: 1,
                    ease: "easeInOut"
                  }} className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{
                    filter: "blur(8px)"
                  }} />}
                  </button>
                </motion.div>
                
                <div className="text-center mt-6 space-y-2">
                  <a href="#" className="text-blue-600 hover:text-blue-700 text-sm transition-colors block">
                    Esqueceu a senha?
                  </a>
                  
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>;
};
export default AuthScreen;