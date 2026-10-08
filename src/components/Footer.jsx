import React from 'react';
import { env } from '../config/env.js';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-surface/80 py-6 text-center text-xs text-muted">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          &copy; {new Date().getFullYear()}{' '}
          <a
            href={env.gurukulSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:text-primaryDark transition underline decoration-dotted"
          >
            Shantigram Gurukul
          </a>
          . All rights reserved.
        </p>
        <p className="italic text-stone-500">
          "Clean Gurukul, Proud Gurukul" &bull; Residential Campus Management
        </p>
      </div>
    </footer>
  );
}
