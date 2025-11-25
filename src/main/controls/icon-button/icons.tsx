import React from 'react';

export const TrashIcon: React.FC<{ width?: number; height?: number }> = ({ 
    width = 16, 
    height = 16 
}) => (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
            d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);

export const EditIcon: React.FC<{ width?: number; height?: number }> = ({ 
    width = 16, 
    height = 16 
}) => (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
            d="M11.3333 2.00001C11.5084 1.82491 11.7163 1.686 11.9451 1.59123C12.1739 1.49646 12.4189 1.44763 12.6667 1.44763C12.9144 1.44763 13.1594 1.49646 13.3882 1.59123C13.617 1.686 13.8249 1.82491 14 2.00001C14.1751 2.17511 14.314 2.38301 14.4088 2.61179C14.5036 2.84057 14.5524 3.08562 14.5524 3.33334C14.5524 3.58106 14.5036 3.82611 14.4088 4.05489C14.314 4.28367 14.1751 4.49157 14 4.66667L5.33333 13.3333L1.33333 14.6667L2.66667 10.6667L11.3333 2.00001Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);

