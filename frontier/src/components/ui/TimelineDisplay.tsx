import React from 'react';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineDot, 
  TimelineConnector, 
  TimelineContent, 
  TimelineOppositeContent 
} from './Timeline';
import { Award, Zap, Flag, MapPin, Check, Bell } from 'lucide-react';

const TimelineDisplay: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Timeline</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Visualizing chronological events with various layouts and indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Column: Standard Layouts */}
        <div className="space-y-12">
            
            {/* 1. Basic Timeline */}
            <div className="space-y-8">
               <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Basic & Icons</h3>
               <div className="p-4 rounded-xl">
                  <Timeline>
                      {/* Simple Dot */}
                      <TimelineItem>
                          <TimelineSeparator>
                              <TimelineDot variant="simple" color="primary" />
                              <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                              <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                              <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline, CTA.</p>
                          </TimelineContent>
                      </TimelineItem>

                      {/* Outline Dot */}
                      <TimelineItem>
                          <TimelineSeparator>
                              <TimelineDot variant="outline" color="primary" size="medium" />
                              <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                              <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                              <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline, CTA.</p>
                          </TimelineContent>
                      </TimelineItem>

                      {/* Icon Solid */}
                      <TimelineItem>
                          <TimelineSeparator>
                              <TimelineDot variant="solid" color="primary">
                                  <Award size={18} />
                              </TimelineDot>
                              <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                              <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                              <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline, CTA.</p>
                          </TimelineContent>
                      </TimelineItem>

                       {/* Icon Outline */}
                       <TimelineItem>
                          <TimelineSeparator>
                              <TimelineDot variant="outline" color="primary">
                                  <MapPin size={18} />
                              </TimelineDot>
                          </TimelineSeparator>
                          <TimelineContent>
                              <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                              <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline, CTA.</p>
                          </TimelineContent>
                      </TimelineItem>
                  </Timeline>
               </div>
            </div>

             {/* 3. Small Icons Timeline */}
             <div className="space-y-8">
               <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Small Icons</h3>
               <div className="p-4 rounded-xl">
                  <Timeline>
                      {/* Icon Solid Small */}
                      <TimelineItem>
                          <TimelineSeparator>
                              <TimelineDot variant="solid" color="primary" className="w-8 h-8">
                                  <Zap size={14} />
                              </TimelineDot>
                              <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                              <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                              <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline.</p>
                          </TimelineContent>
                      </TimelineItem>

                       {/* Icon Outline Small */}
                       <TimelineItem>
                          <TimelineSeparator>
                              <TimelineDot variant="outline" color="primary" className="w-8 h-8 border-[1.5px]">
                                  <Flag size={14} />
                              </TimelineDot>
                          </TimelineSeparator>
                          <TimelineContent>
                              <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                              <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline.</p>
                          </TimelineContent>
                      </TimelineItem>
                  </Timeline>
               </div>
            </div>

        </div>

        {/* Right Column: Center / Alternating Layout */}
        <div className="space-y-12">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Alternating Center</h3>
            
            <div className="p-4">
                <Timeline align="center">
                    
                    {/* Item 1: Right Content */}
                    <TimelineItem>
                         <TimelineOppositeContent>
                            09:30 am
                         </TimelineOppositeContent>
                         <TimelineSeparator>
                             <TimelineDot variant="simple" color="primary" />
                             <TimelineConnector />
                         </TimelineSeparator>
                         <TimelineContent>
                             <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                             <p className="text-xs text-grey-500">Sleek hero section with bold title, clear CTA, and vivid images.</p>
                         </TimelineContent>
                    </TimelineItem>

                    {/* Item 2: Left Content */}
                    <TimelineItem className="flex-row-reverse">
                         <TimelineOppositeContent className="text-left">
                            10:00 am
                         </TimelineOppositeContent>
                         <TimelineSeparator>
                             <TimelineDot variant="simple" color="success" />
                             <TimelineConnector />
                         </TimelineSeparator>
                         <TimelineContent className="text-right">
                             <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Left Title</h4>
                             <p className="text-xs text-grey-500">Clean hero with sharp title, clear button, and vivid images.</p>
                         </TimelineContent>
                    </TimelineItem>

                    {/* Item 3: Right Content (Hollow) */}
                    <TimelineItem>
                         <TimelineOppositeContent>
                            09:30 am
                         </TimelineOppositeContent>
                         <TimelineSeparator>
                             <TimelineDot variant="outline" color="primary" size="medium" />
                             <TimelineConnector />
                         </TimelineSeparator>
                         <TimelineContent>
                             <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                             <p className="text-xs text-grey-500">Sleek hero section with bold title, clear CTA, and vivid images.</p>
                         </TimelineContent>
                    </TimelineItem>

                    {/* Item 4: Left Content (Hollow) */}
                    <TimelineItem className="flex-row-reverse">
                         <TimelineOppositeContent className="text-left">
                            10:00 am
                         </TimelineOppositeContent>
                         <TimelineSeparator>
                             <TimelineDot variant="outline" color="success" size="medium" />
                             <TimelineConnector />
                         </TimelineSeparator>
                         <TimelineContent className="text-right">
                             <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Left Title</h4>
                             <p className="text-xs text-grey-500">Clean hero with sharp title, clear button, and vivid images.</p>
                         </TimelineContent>
                    </TimelineItem>

                     {/* Item 5: Right Content (Icon) */}
                     <TimelineItem>
                         <TimelineOppositeContent className="py-4">
                            09:30 am
                         </TimelineOppositeContent>
                         <TimelineSeparator>
                             <TimelineDot variant="solid" color="primary">
                                 <Bell size={18} />
                             </TimelineDot>
                             <TimelineConnector />
                         </TimelineSeparator>
                         <TimelineContent className="py-2">
                             <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Right Title</h4>
                             <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline, CTA.</p>
                         </TimelineContent>
                    </TimelineItem>
                    
                    {/* Item 6: Left Content (Icon) */}
                    <TimelineItem className="flex-row-reverse">
                         <TimelineOppositeContent className="text-left py-4">
                            10:00 am
                         </TimelineOppositeContent>
                         <TimelineSeparator>
                             <TimelineDot variant="solid" color="success">
                                 <Check size={18} />
                             </TimelineDot>
                         </TimelineSeparator>
                         <TimelineContent className="text-right py-2">
                             <h4 className="font-semibold text-grey-900 dark:text-white text-sm mb-1">Left Title</h4>
                             <p className="text-xs text-grey-500">Modern, sleek hero section with bold headline, CTA.</p>
                         </TimelineContent>
                    </TimelineItem>

                </Timeline>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TimelineDisplay;