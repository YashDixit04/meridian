import React from 'react';
import Badge, { BadgeColor } from './Badge';
import Avatar, { AvatarSize } from './Avatar';
import ProgressCircle from './ProgressCircle';
import ProgressBar from './ProgressBar';
import Rating from './Rating';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from './Breadcrumb';
import { User, Home } from 'lucide-react';

const DataDisplay: React.FC = () => {
  const colors: BadgeColor[] = ['primary', 'success', 'danger', 'info', 'warning', 'dark', 'light'];
  
  // Avatars data
  const avatarSizes: AvatarSize[] = ['xl', 'lg', 'md', 'sm', 'xs', 'xxs'];
  const testImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Data Display</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Components for displaying status, user information, navigation paths, progress, and ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16">
        
        {/* Left Column */}
        <div className="space-y-16">

             {/* Breadcrumbs Section */}
             <div className="space-y-8">
                <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Breadcrumbs</h3>
                
                <div className="flex flex-col gap-8 p-6 border border-dashed border-info/50 rounded-xl bg-info-soft/20 dark:bg-info-soft/5">
                    
                    {/* Style 1: With Icons */}
                    <div className="flex flex-col sm:flex-row gap-8 justify-between">
                         <Breadcrumb>
                             <BreadcrumbItem href="#">
                                 <Home size={16} />
                             </BreadcrumbItem>
                             <BreadcrumbSeparator />
                             <BreadcrumbItem href="#">Account</BreadcrumbItem>
                             <BreadcrumbSeparator />
                             <BreadcrumbItem active>Overview</BreadcrumbItem>
                         </Breadcrumb>
                         
                         {/* Duplicate for visual balance as per image roughly */}
                         <div className="hidden sm:block opacity-50">
                             <Breadcrumb>
                                 <BreadcrumbItem href="#">
                                     <Home size={16} />
                                 </BreadcrumbItem>
                                 <BreadcrumbSeparator />
                                 <BreadcrumbItem href="#">Account</BreadcrumbItem>
                                 <BreadcrumbSeparator />
                                 <BreadcrumbItem active>Overview</BreadcrumbItem>
                             </Breadcrumb>
                         </div>
                    </div>

                    {/* Style 2: Text Only with Slash */}
                    <div className="flex flex-col sm:flex-row gap-8 justify-between">
                        <Breadcrumb>
                             <BreadcrumbItem href="#">Home</BreadcrumbItem>
                             <BreadcrumbSeparator>/</BreadcrumbSeparator>
                             <BreadcrumbItem href="#">File Manager</BreadcrumbItem>
                             <BreadcrumbSeparator>/</BreadcrumbSeparator>
                             <BreadcrumbItem active>Overview</BreadcrumbItem>
                         </Breadcrumb>

                          <div className="hidden sm:block opacity-50">
                             <Breadcrumb>
                                 <BreadcrumbItem href="#">Home</BreadcrumbItem>
                                 <BreadcrumbSeparator>/</BreadcrumbSeparator>
                                 <BreadcrumbItem href="#">File Manager</BreadcrumbItem>
                                 <BreadcrumbSeparator>/</BreadcrumbSeparator>
                                 <BreadcrumbItem active>Overview</BreadcrumbItem>
                             </Breadcrumb>
                         </div>
                    </div>
                </div>
            </div>
            
            {/* Badges Section */}
            <div className="space-y-8">
                <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Badges</h3>
                
                {/* Solid Badges */}
                <div className="space-y-4">
                     <span className="text-sm text-grey-500">Solid</span>
                     <div className="flex flex-wrap gap-4">
                        {colors.map(color => (
                            <div key={color} className="flex flex-col gap-2">
                                <Badge color={color} size="large">Large</Badge>
                                <Badge color={color} size="medium">Medium</Badge>
                                <Badge color={color} size="small">Small</Badge>
                            </div>
                        ))}
                     </div>
                </div>

                {/* Soft Badges */}
                <div className="space-y-4">
                     <span className="text-sm text-grey-500">Soft</span>
                     <div className="flex flex-wrap gap-4">
                        {colors.map(color => (
                            <div key={color} className="flex flex-col gap-2">
                                <Badge variant="soft" color={color} size="large">Large</Badge>
                                <Badge variant="soft" color={color} size="medium">Medium</Badge>
                                <Badge variant="soft" color={color} size="small">Small</Badge>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            {/* Ratings Section */}
            <div className="space-y-8">
                <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Ratings</h3>
                
                <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <div className="text-sm text-grey-500">Stars</div>
                        <Rating rating={5} type="star" />
                        <Rating rating={4} type="star" />
                        <Rating rating={3} type="star" />
                        <Rating rating={2} type="star" />
                        <Rating rating={0} type="star" />
                     </div>

                     <div className="space-y-2">
                        <div className="text-sm text-grey-500">Hearts</div>
                        <Rating rating={5} type="heart" />
                        <Rating rating={4} type="heart" />
                        <Rating rating={3} type="heart" />
                        <Rating rating={2} type="heart" />
                        <Rating rating={0} type="heart" />
                     </div>
                     
                     <div className="space-y-2 col-span-2">
                         <div className="text-sm text-grey-500">Emojis</div>
                         <Rating rating={5} type="emoji" />
                         <Rating rating={3} type="emoji" />
                         <Rating rating={1} type="emoji" />
                     </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-8">
                 <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Progress</h3>
                 
                 {/* Linear */}
                 <div className="space-y-4">
                    <ProgressBar percentage={40} color="primary" showLabel />
                    <ProgressBar percentage={60} color="success" showLabel />
                    <ProgressBar percentage={80} color="danger" showLabel />
                    <ProgressBar percentage={30} color="info" showLabel />
                    <ProgressBar percentage={90} color="warning" showLabel />
                 </div>

                 {/* Circular */}
                 <div className="flex flex-wrap gap-8 items-center pt-4">
                    <ProgressCircle percentage={60} color="primary" />
                    <ProgressCircle percentage={60} color="success" />
                    <ProgressCircle percentage={60} color="danger" />
                    <ProgressCircle percentage={60} color="info" />
                    <ProgressCircle percentage={60} color="warning" />
                    <ProgressCircle percentage={60} color="primary" size={40} strokeWidth={3} showLabel={false} />
                 </div>
            </div>

        </div>

        {/* Right Column: Avatars */}
        <div className="space-y-8">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Avatars</h3>
            
            <div className="space-y-10 overflow-x-auto">
                
                {/* 1. Image Circle */}
                <div className="flex items-end gap-4">
                    {avatarSizes.map((size, i) => (
                        <Avatar key={size} size={size} src={testImage} status={i % 2 === 0 ? 'online' : undefined} />
                    ))}
                </div>

                {/* 2. Image Square */}
                <div className="flex items-end gap-4">
                    {avatarSizes.map((size, i) => (
                        <Avatar key={size} size={size} shape="square" src={testImage} status={i % 2 !== 0 ? 'busy' : undefined} />
                    ))}
                </div>

                {/* 3. Placeholder Outline Circle */}
                <div className="flex items-end gap-4">
                    {avatarSizes.map((size) => (
                        <div key={size} className={`${size === 'xl' ? 'w-16 h-16' : size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-12 h-12' : size === 'sm' ? 'w-10 h-10' : size === 'xs' ? 'w-8 h-8' : 'w-6 h-6'} rounded-full border border-grey-300 dark:border-grey-700 flex items-center justify-center text-grey-400`}>
                             <User size="50%" strokeWidth={1.5} />
                        </div>
                    ))}
                </div>

                {/* 4. Placeholder Outline Square */}
                <div className="flex items-end gap-4">
                     {avatarSizes.map((size) => (
                        <div key={size} className={`${size === 'xl' ? 'w-16 h-16' : size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-12 h-12' : size === 'sm' ? 'w-10 h-10' : size === 'xs' ? 'w-8 h-8' : 'w-6 h-6'} rounded-lg border border-grey-300 dark:border-grey-700 flex items-center justify-center text-grey-400`}>
                             <User size="50%" strokeWidth={1.5} />
                        </div>
                    ))}
                </div>

                {/* 5. Initials Soft Circle */}
                <div className="flex items-end gap-4">
                    {avatarSizes.map((size) => (
                        <Avatar key={size} size={size} initials="A" isSoft />
                    ))}
                </div>

                {/* 6. Initials Soft Square */}
                <div className="flex items-end gap-4">
                    {avatarSizes.map((size) => (
                        <Avatar key={size} size={size} shape="square" initials="A" isSoft />
                    ))}
                </div>

                 {/* 7. Dark Initials Circle */}
                 <div className="flex items-end gap-4">
                    {avatarSizes.map((size) => (
                        <Avatar key={size} size={size} initials="A" />
                    ))}
                </div>

                 {/* 8. Dark Initials Square */}
                 <div className="flex items-end gap-4">
                    {avatarSizes.map((size) => (
                        <Avatar key={size} size={size} shape="square" initials="A" />
                    ))}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;