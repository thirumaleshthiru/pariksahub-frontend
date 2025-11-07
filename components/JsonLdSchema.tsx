'use client';

import { useEffect } from 'react';

interface JsonLdSchemaProps {
  schema: object;
  id?: string;
}

export default function JsonLdSchema({ schema, id = 'json-ld-schema' }: JsonLdSchemaProps) {
  useEffect(() => {
    // Remove existing script if it exists
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Find where to insert - after analytics scripts
    const analyticsScript = document.getElementById('google-analytics-config');
    const insertPoint = analyticsScript ? analyticsScript.nextSibling : document.head.firstChild;

    // Create and insert script in head (after analytics)
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    
    if (insertPoint) {
      document.head.insertBefore(script, insertPoint);
    } else {
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema, id]);

  return null;
}

