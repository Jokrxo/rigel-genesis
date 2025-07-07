import { LucideIcon } from "lucide-react";
import React from "react";

interface FeatureCardProps {
  imageSrc: string;
  imageAlt: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({
  imageSrc,
  imageAlt,
  icon: Icon,
  title,
  description,
}: FeatureCardProps) => {
  // If image fails, fallback to /placeholder.svg as before
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl border border-financial-200 hover:border-financial-400 transition-all duration-300 overflow-hidden">
      <div className="relative">
        {!imgError ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-financial-50">
            <img src="/lovable-uploads/globe.png" alt="placeholder" className="w-14 h-14 opacity-70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-financial-900/20 to-transparent"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-financial-500 to-financial-600 text-white shadow-lg">
          <Icon className="w-7 h-7" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-financial-900 group-hover:text-financial-700 transition-colors">
            {title}
          </h3>
          <p className="text-financial-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
