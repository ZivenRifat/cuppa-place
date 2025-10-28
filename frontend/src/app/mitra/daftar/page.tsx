"use client";

import { useState } from "react";
import StepIndicator from "@/components/mitra-form/StepIndicator";
import StepIdentitas from "@/components/mitra-form/StepIdentitas";
import StepFasilitas from "@/components/mitra-form/StepFasilitas";
import StepVerifikasi from "@/components/mitra-form/StepVerifikasi";
import Navbar from "@/components/Navbar";

export default function GabungMitraPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#271F01] overflow-hidden">
      {/* Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Step Indicator */}
      <div className="sticky top-10">
        <div className="pt-[72px]">
          <StepIndicator step={step} />
        </div>
      </div>

      {/* Konten Form - rata tengah, tinggi seragam */}
      <div className="flex-1 flex items-center justify-center px-8 pb-12">
        <div className="w-full max-w-3xl min-h-[520px] flex flex-col justify-between">
          {/* Step konten */}
          <div className="flex-1">
            {step === 1 && <StepIdentitas onNext={() => setStep(2)} />}
            {step === 2 && <StepFasilitas onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <StepVerifikasi onBack={() => setStep(2)} onVerify={() => alert("Verifikasi berhasil!")} />}
          </div>
        </div>
      </div>
    </div>
  );
}
