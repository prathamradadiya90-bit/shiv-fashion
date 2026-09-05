
const CheckoutSteps = ({ step1, step2, step3 }) => {
  return (
    <div className="flex justify-center mb-8 w-full max-w-lg">
      <div className="flex items-center w-full">
        {/* Step 1 */}
        <div className={`flex flex-col items-center ${step1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
          <span className="text-xs font-medium mt-1">Login</span>
        </div>
        <div className={`flex-auto border-t-2 transition duration-500 ease-in-out mx-2 ${step2 ? 'border-primary' : 'border-gray-200'}`}></div>
        
        {/* Step 2 */}
        <div className={`flex flex-col items-center ${step2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
          <span className="text-xs font-medium mt-1">Shipping</span>
        </div>
        <div className={`flex-auto border-t-2 transition duration-500 ease-in-out mx-2 ${step3 ? 'border-primary' : 'border-gray-200'}`}></div>
        
        {/* Step 3 */}
        <div className={`flex flex-col items-center ${step3 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
          <span className="text-xs font-medium mt-1">Place Order</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
