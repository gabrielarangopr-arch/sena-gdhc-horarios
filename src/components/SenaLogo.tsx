import React, { useState } from 'react';

export const SENA_LOGO_URL = 'https://senacertificados.co/wp-content/uploads/2021/10/Logo-de-SENA-png-verde-300x300-1.png';

interface SenaLogoProps {
  className?: string;
  variant?: 'color' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtext?: string;
}

/**
 * Logotipo Oficial del Servicio Nacional de Aprendizaje (SENA)
 * Utiliza la imagen institucional oficial verde provista por el usuario.
 */
export const SenaLogo: React.FC<SenaLogoProps> = ({
  className = '',
  variant = 'color',
  size = 'md',
  showText = true,
  subtext = 'GDHC • Horarios',
}) => {
  const [imageError, setImageError] = useState(false);

  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  const textColor = isWhite ? 'text-white' : 'text-[#00324D] dark:text-white';
  const subtextColor = isWhite ? 'text-white/80' : 'text-slate-500 dark:text-slate-400';

  const imgSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Imagen Oficial del Logo SENA */}
      <div className={`relative flex items-center justify-center shrink-0 ${imgSizes[size]}`}>
        {!imageError ? (
          <img
            src={SENA_LOGO_URL}
            alt="Logo SENA Verde"
            className={`w-full h-full object-contain ${
              isWhite ? 'brightness-0 invert' : ''
            }`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Fallback vectorial en caso de falla de conexión */
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            <circle cx="50" cy="16" r="9" fill={isWhite ? '#FFFFFF' : '#39A900'} />
            <path
              d="M20 38 C32 30, 68 30, 80 38 C75 42, 65 38, 50 38 C35 38, 25 42, 20 38 Z"
              fill={isWhite ? '#FFFFFF' : '#39A900'}
            />
            <path d="M32 44 L16 88 L26 88 L39 46 Z" fill={isWhite ? '#FFFFFF' : '#39A900'} />
            <path d="M45.5 44 L45.5 88 L54.5 88 L54.5 44 Z" fill={isWhite ? '#FFFFFF' : '#39A900'} />
            <path d="M61 46 L74 88 L84 88 L68 44 Z" fill={isWhite ? '#FFFFFF' : '#39A900'} />
          </svg>
        )}
      </div>

      {/* Tipografía Oficial y Subtexto */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span className={`font-extrabold tracking-wide ${textColor} ${textSizes[size]}`}>
            SENA
          </span>
          {subtext && (
            <span className={`text-[11px] font-medium tracking-normal mt-0.5 ${subtextColor}`}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
