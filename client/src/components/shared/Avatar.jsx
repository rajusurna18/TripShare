import React from "react";

// Standard TripShare branding color: orange/amber (#fb8500 / #ffb703)
export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fb8500'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

export function Avatar({ src, alt = "avatar", className = "", style = {}, size = 40 }) {
  const avatarSrc = src || DEFAULT_AVATAR;

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={`rounded-circle object-fit-cover ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        ...style
      }}
      onError={(e) => {
        if (e.target.src !== DEFAULT_AVATAR) {
          e.target.src = DEFAULT_AVATAR;
        }
      }}
    />
  );
}

export default Avatar;
