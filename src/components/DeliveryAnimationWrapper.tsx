"use client";

import dynamic from "next/dynamic";

const DeliveryAnimation = dynamic(() => import("./DeliveryAnimation"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#4338ca] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat animasi...</p>
      </div>
    </div>
  ),
});

export default DeliveryAnimation;
