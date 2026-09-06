import React, { useState } from 'react';
import { DraggableList } from './DraggableList';
import { Heading5, Heading6 } from './Typography';
import draggableExamples from '@/data/json/draggableListExamples.json';
import Combobox from './Combobox';

export default function DraggableListDisplay() {
  // State for each example type
  const [basicItems, setBasicItems] = useState<any[]>(
    draggableExamples.examples.find(ex => ex.id === 'basic')?.items || []
  );

  const [variantItems, setVariantItems] = useState<any[]>(
    draggableExamples.examples.find(ex => ex.id === 'variants')?.items || []
  );

  const [taskItems, setTaskItems] = useState<any[]>(
    draggableExamples.examples.find(ex => ex.id === 'tasks')?.items || []
  );

  const [featureItems, setFeatureItems] = useState<any[]>(
    draggableExamples.examples.find(ex => ex.id === 'features')?.items || []
  );

  const onRemoveBasic = (id: string) => setBasicItems(prev => prev.filter(i => i.id !== id));
  const onRemoveVariant = (id: string) => setVariantItems(prev => prev.filter(i => i.id !== id));
  const onRemoveTask = (id: string) => setTaskItems(prev => prev.filter(i => i.id !== id));
  const onRemoveFeature = (id: string) => setFeatureItems(prev => prev.filter(i => i.id !== id));

  const basicExample = draggableExamples.examples.find(ex => ex.id === 'basic');
  const variantsExample = draggableExamples.examples.find(ex => ex.id === 'variants');
  const tasksExample = draggableExamples.examples.find(ex => ex.id === 'tasks');
  const featuresExample = draggableExamples.examples.find(ex => ex.id === 'features');

  return (
    <section className="space-y-8">
      <div className="border-b border-grey-200 dark:border-grey-800 pb-4">
        <Heading5>Draggable List Component</Heading5>
        <p className="text-sm text-grey-500 mt-1">
          Reusable component for reordering items via drag and drop. Supports multiple use cases with customizable rendering.
        </p>
      </div>

      {/* Basic Example */}
      <div className="space-y-3">
        <div>
          <Heading6>{basicExample?.title}</Heading6>
          <p className="text-xs text-grey-500 mt-1">{basicExample?.description}</p>
        </div>
        <div className="max-w-md bg-grey-50 dark:bg-grey-800/20 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
          <DraggableList
            items={basicItems}
            setItems={setBasicItems}
            onRemove={onRemoveBasic}
            renderItem={(item: any) => (
              <div className="flex-1 space-y-0.5">
                <div className="text-sm font-semibold text-grey-800 dark:text-grey-200">
                  {item.title}
                </div>
                <div className="text-xs text-grey-500">
                  {item.content}
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Product Variants Example */}
      <div className="space-y-3">
        <div>
          <Heading6>{variantsExample?.title}</Heading6>
          <p className="text-xs text-grey-500 mt-1">{variantsExample?.description}</p>
        </div>
        <div className="max-w-md bg-grey-50 dark:bg-grey-800/20 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
          <DraggableList
            items={variantItems}
            setItems={setVariantItems}
            onRemove={onRemoveVariant}
            renderItem={(item: any) => (
              <div className="flex-1 space-y-2">
                <span className="text-xs text-grey-500 font-medium">{item.option}</span>
                <Combobox
                  placeholder="Select variant type"
                  value={item.type}
                  options={[
                    { value: 'Size', label: 'Size' },
                    { value: 'Color', label: 'Color' },
                    { value: 'Material', label: 'Material' },
                    { value: 'Style', label: 'Style' },
                  ]}
                  size="small"
                  className="bg-white dark:bg-grey-800 border-grey-200"
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Task List Example */}
      <div className="space-y-3">
        <div>
          <Heading6>{tasksExample?.title}</Heading6>
          <p className="text-xs text-grey-500 mt-1">{tasksExample?.description}</p>
        </div>
        <div className="max-w-2xl bg-grey-50 dark:bg-grey-800/20 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
          <DraggableList
            items={taskItems}
            setItems={setTaskItems}
            onRemove={onRemoveTask}
            renderItem={(item: any) => (
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-semibold text-grey-800 dark:text-grey-200">
                    {item.task}
                  </div>
                  <div className="text-xs text-grey-500">
                    Status: {item.status}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.priority === 'High'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : item.priority === 'Medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {item.priority}
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Features Example */}
      <div className="space-y-3">
        <div>
          <Heading6>{featuresExample?.title}</Heading6>
          <p className="text-xs text-grey-500 mt-1">{featuresExample?.description}</p>
        </div>
        <div className="max-w-2xl bg-grey-50 dark:bg-grey-800/20 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
          <DraggableList
            items={featureItems}
            setItems={setFeatureItems}
            onRemove={onRemoveFeature}
            renderItem={(item: any) => (
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="text-sm font-semibold text-grey-800 dark:text-grey-200">
                    {item.feature}
                  </div>
                  <div className="text-xs text-grey-500">
                    {item.description}
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Usage Guide */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
        <Heading6 className="text-blue-900 dark:text-blue-300">How to Use</Heading6>
        <ul className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Drag:</strong> Click and hold the grip icon (⋮⋮) to reorder items</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Remove:</strong> Click the trash icon to delete an item</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Keyboard:</strong> Use Tab, Enter, and Arrow keys for accessibility</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Visual Feedback:</strong> Items highlight when being dragged</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
