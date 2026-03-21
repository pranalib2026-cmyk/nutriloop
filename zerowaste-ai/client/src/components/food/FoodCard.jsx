import { formatDistanceToNow } from 'date-fns';

const FoodCard = ({ listing, onAccept }) => {
  const isUrgent = listing.isUrgent;
  const isExpired = new Date(listing.expiresAt) < new Date();
  
  return (
    <div className="card flex flex-col h-full cursor-pointer overflow-hidden p-0" onClick={() => onAccept(listing)}>
      <div className="relative h-48 w-full bg-surface-alt">
        {listing.images && listing.images[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍲</div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {isUrgent && <span className="bg-danger text-white text-xs px-2 py-1 rounded shadow flex items-center gap-1">🔥 Urgent</span>}
          <span className={`badge-${listing.status}`}>{listing.status}</span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-text-primary truncate mb-2">{listing.title}</h3>
        
        <div className="flex items-center text-sm text-text-secondary mb-2">
          <span className="mr-1">📍</span>
          <span className="truncate">{listing.pickupAddress}</span>
          {listing.distance_km !== undefined && (
            <span className="ml-2 font-medium text-primary">({listing.distance_km} km)</span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <span className="mr-1">🍽️</span>
          <span>{listing.quantity} {listing.unit}</span>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
              {listing.restaurantId?.profilePhoto ? (
                <img src={listing.restaurantId.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                listing.restaurantId?.name?.charAt(0) || 'R'
              )}
            </div>
            <span className="text-sm font-medium truncate max-w-[100px]">{listing.restaurantId?.name}</span>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-text-secondary block">Expires</span>
            <span className={`text-sm font-bold ${isUrgent ? 'text-danger' : 'text-text-primary'}`}>
               {isExpired ? 'Expired' : formatDistanceToNow(new Date(listing.expiresAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
