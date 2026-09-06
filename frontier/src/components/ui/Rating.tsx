import React from 'react';
import { Star, Heart, Smile, Meh, Frown } from 'lucide-react';

export type RatingType = 'star' | 'heart' | 'emoji';

interface RatingProps {
  rating: number; // 0 to 5
  max?: number;
  type?: RatingType;
  readOnly?: boolean;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  max = 5,
  type = 'star',
  size = 16,
}) => {
  const renderStar = (index: number) => {
    const filled = index <= rating;
    return (
      <Star
        key={index}
        size={size}
        className={`${filled ? 'fill-warning text-warning' : 'text-grey-300 dark:text-grey-700'}`}
      />
    );
  };

  const renderHeart = (index: number) => {
    const filled = index <= rating;
    return (
      <Heart
        key={index}
        size={size}
        className={`${filled ? 'fill-danger text-danger' : 'text-grey-300 dark:text-grey-700'}`}
      />
    );
  };

  const renderEmoji = () => {
    return Array.from({ length: max }, (_, i) => {
        const index = i + 1;
        const active = index <= rating;
        
        let Icon = Smile;
        let colorClass = 'text-success';

        if (index <= 2) { Icon = Frown; colorClass = 'text-danger'; }
        else if (index === 3) { Icon = Meh; colorClass = 'text-warning'; }
        
        return (
            <Icon 
                key={index} 
                size={size} 
                className={active ? colorClass : 'text-grey-300 dark:text-grey-700'} 
            />
        );
    });
  };

  return (
    <div className="flex items-center gap-1">
      {type === 'emoji' ? renderEmoji() : (
        Array.from({ length: max }, (_, i) => (
            type === 'star' ? renderStar(i + 1) : renderHeart(i + 1)
        ))
      )}
    </div>
  );
};

export default Rating;