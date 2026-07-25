'use client';

import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Clock, CheckCircle, ChefHat, Truck, Circle } from 'lucide-react';

interface OrderStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

interface OrderTrackingProps {
  orderId: string;
  estimatedTime: number;
}

export function OrderTracking({ orderId, estimatedTime }: OrderTrackingProps) {
  const steps: OrderStep[] = [
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been received',
      icon: <CheckCircle className="w-6 h-6" />,
      completed: true,
      current: false,
    },
    {
      id: 'preparing',
      title: 'Preparing',
      description: 'Chef is preparing your dishes',
      icon: <ChefHat className="w-6 h-6" />,
      completed: true,
      current: true,
    },
    {
      id: 'ready',
      title: 'Ready',
      description: 'Your order is ready for serving',
      icon: <Clock className="w-6 h-6" />,
      completed: false,
      current: false,
    },
    {
      id: 'served',
      title: 'Served',
      description: 'Enjoy your meal!',
      icon: <Truck className="w-6 h-6" />,
      completed: false,
      current: false,
    },
  ];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">Order #{orderId}</h3>
          <p className="text-sm text-black/60 dark:text-white/60">
            Estimated time: {estimatedTime} mins
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#2563EB]">{estimatedTime - 8}</div>
          <div className="text-xs text-black/60 dark:text-white/60">mins remaining</div>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {index !== steps.length - 1 && (
              <div
                className={`absolute left-6 top-12 w-0.5 h-full ${
                  step.completed ? 'bg-[#2563EB]' : 'bg-[#2563EB]/20'
                }`}
              />
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-[#2563EB] text-white'
                    : step.current
                    ? 'bg-[#2563EB]/20 text-[#2563EB] border-2 border-[#2563EB]'
                    : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'
                }`}
              >
                {step.completed ? step.icon : <Circle className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 pt-2">
                <h4
                  className={`font-bold ${
                    step.completed || step.current
                      ? 'text-black dark:text-white'
                      : 'text-black/40 dark:text-white/40'
                  }`}
                >
                  {step.title}
                </h4>
                <p
                  className={`text-sm ${
                    step.completed || step.current
                      ? 'text-black/60 dark:text-white/60'
                      : 'text-black/30 dark:text-white/30'
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="flex justify-between text-sm text-black/60 dark:text-white/60 mb-2">
          <span>Order Progress</span>
          <span>50%</span>
        </div>
        <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '50%' }}
            transition={{ duration: 1 }}
            className="h-full bg-[#2563EB] rounded-full"
          />
        </div>
      </div>
    </GlassCard>
  );
}