import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  DollarSign,
  Calendar,
  User,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react';
import { useCRMStore, Deal } from '../stores/crmStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const probabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-100';
    if (probability >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 
        cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
          {deal.title}
        </h4>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            ${deal.value.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Close: {format(new Date(deal.closeDate), 'MMM dd')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {deal.assignedTo}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${probabilityColor(deal.probability)}`}>
          {deal.probability}%
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            {format(new Date(deal.updatedAt), 'MMM dd')}
          </span>
        </div>
      </div>
    </div>
  );
};

interface PipelineColumnProps {
  stage: string;
  title: string;
  deals: Deal[];
  color: string;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, title, deals, color }) => {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 min-h-[600px] w-80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${color} rounded-full`}></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
              {deals.length}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ${totalValue.toLocaleString()}
          </p>
        </div>
        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <SortableContext items={deals.map(deal => deal.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence>
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DealCard deal={deal} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </div>
  );
};

const Pipeline: React.FC = () => {
  const { deals, updateDeal } = useCRMStore();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const pipelineStages = [
    { id: 'prospecting', title: 'Prospecting', color: 'bg-blue-500' },
    { id: 'qualification', title: 'Qualification', color: 'bg-yellow-500' },
    { id: 'proposal', title: 'Proposal', color: 'bg-orange-500' },
    { id: 'negotiation', title: 'Negotiation', color: 'bg-purple-500' },
    { id: 'closed-won', title: 'Closed Won', color: 'bg-green-500' },
    { id: 'closed-lost', title: 'Closed Lost', color: 'bg-red-500' },
  ];

  const getDealsByStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = deals.find(d => d.id === active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveDeal(null);
      return;
    }

    // Find the stage from the over container
    const overId = over.id as string;
    let newStage = '';
    
    // Check if we're dropping over a stage column
    const stageColumn = pipelineStages.find(stage => stage.id === overId);
    if (stageColumn) {
      newStage = stageColumn.id;
    } else {
      // If dropping over another deal, find its stage
      const overDeal = deals.find(d => d.id === overId);
      if (overDeal) {
        newStage = overDeal.stage;
      }
    }

    if (newStage && active.id !== over.id) {
      const deal = deals.find(d => d.id === active.id);
      if (deal && deal.stage !== newStage) {
        updateDeal(deal.id, { stage: newStage as any });
        toast.success(`Deal moved to ${pipelineStages.find(s => s.id === newStage)?.title}`);
      }
    }

    setActiveDeal(null);
  };

  const totalPipelineValue = deals
    .filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.value, 0);

  const wonValue = deals
    .filter(deal => deal.stage === 'closed-won')
    .reduce((sum, deal) => sum + deal.value, 0);

  const conversionRate = deals.length > 0 
    ? (deals.filter(deal => deal.stage === 'closed-won').length / deals.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sales Pipeline
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your deals through the sales process
          </p>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalPipelineValue.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Won This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${wonValue.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">%</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pipeline Board */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage.id}
                title={stage.title}
                deals={getDealsByStage(stage.id)}
                color={stage.color}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {deals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No deals in your pipeline yet. Start by adding some deals!
          </p>
        </div>
      )}
    </div>
  );
};

export default Pipeline;