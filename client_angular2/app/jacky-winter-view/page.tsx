import React from 'react';
import './styles.css';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Added EnhancedNavbar

const JackyWinterView = () => {
  // Sample data - replace with actual data as needed
  const cardsData = [
    { id: 1, imageUrl: '/img/1.webp', title: 'Advertiser 1' },
    { id: 2, imageUrl: '/img/2.webp', title: 'Advertiser 2' },
    { id: 3, imageUrl: '/img/3.webp', title: 'Advertiser 3' },
    { id: 4, imageUrl: '/img/4.webp', title: 'Advertiser 4' },
    { id: 5, imageUrl: '/img/5.jpeg', title: 'Advertiser 5' },
    { id: 6, imageUrl: '/img/6.jpeg', title: 'Advertiser 6' },
    { id: 7, imageUrl: '/img/7.jpeg', title: 'Advertiser 7' },
    { id: 8, imageUrl: '/img/8.webp', title: 'Advertiser 8' },
  ];

  return (
    (
      <>
        {' '}
        {/* Added Fragment */}
        <EnhancedNavbar /> {/* Added EnhancedNavbar */}
        <div className="jw-container">
          {cardsData.map(card => (
            <div key={card.id} className="jw-card">
              <img src={card.imageUrl} alt={card.title} className="jw-card-image" />
              <div className="jw-card-title">{card.title}</div>
            </div>
          ))}
        </div>
      </>
    ),
    {
      /* Added Fragment */
    }
  );
};

export default JackyWinterView;
