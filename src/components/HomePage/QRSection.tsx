import { QRCodeGenerator } from "@/components/Shared/QRCodeGenerator";
import { Share2, Smartphone } from "lucide-react";

const financeImages = [
  { src: "/photo-1488590528505-98d2b5aba04b", alt: "Modern finance workspace" },
  { src: "/photo-1498050108023-c5249f4df085", alt: "Laptop with finance code" },
];

export const QRSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-financial-100 text-financial-800 rounded-full text-sm font-medium">
                <Share2 className="w-4 h-4" />
                Share & Connect
              </div>
              <h2 className="text-4xl font-bold text-financial-900 leading-tight">
                Share Rigel with Your Network
              </h2>
              <p className="text-lg text-financial-700 leading-relaxed">
                Use our QR code to instantly share our financial management platform with colleagues, clients, or business partners who could benefit from streamlined financial operations.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-financial-50 rounded-lg border border-financial-200">
                <Smartphone className="w-6 h-6 text-financial-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-financial-900 mb-1">Quick Access</h3>
                  <p className="text-financial-700 text-sm">Simply scan with any smartphone camera to be directed to our registration page.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-financial-400 to-financial-600 rounded-xl blur opacity-20"></div>
              <img 
                src={financeImages[1].src} 
                alt="Finance technology" 
                className="relative w-48 h-32 object-cover rounded-xl shadow-lg border-2 border-financial-300" 
                onError={(e) => ((e.target as HTMLImageElement).src = "/lovable-uploads/globe.png")}
              />
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-financial-200">
              <QRCodeGenerator />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
