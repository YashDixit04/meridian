import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

export interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  onRemove?: () => void;
}

const SortableItem: React.FC<DraggableItemProps> = ({ id, children, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-3 bg-white dark:bg-grey-200 p-2 border border-grey-200 rounded-lg shadow-sm overflow-visible ${
        isDragging ? 'shadow-lg border-primary dark:border-primary opacity-90' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-grey-100 dark:hover:bg-grey-100 p-1.5 rounded-md flex-shrink-0 text-grey-400"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1 overflow-visible">{children}</div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 text-grey-400 hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

interface DraggableListProps<T extends { id: string }> {
  items: T[];
  setItems: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  onRemove?: (id: string) => void;
  className?: string;
}

export function DraggableList<T extends { id: string }>({ items, setItems, renderItem, onRemove, className = '' }: DraggableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={`flex flex-col gap-2 w-full overflow-visible ${className}`}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} onRemove={onRemove ? () => onRemove(item.id) : undefined}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
