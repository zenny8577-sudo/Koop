const CountryBadge = ({ countryCode, deliveryDays }) => {
  const flags = {
    NL: '🇳🇱',
    CN: '🇨🇳',
    DE: '🇩🇪'
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
      <span>{flags[countryCode]}</span>
      <span className="text-sm">
        Entrega: {deliveryDays} dias
      </span>
    </div>
  );
};