import { useState, useEffect } from 'react';
import styles from '../../styles/Pages.module.css';

export default function New({ navigateToPage}) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
              const imageElements = document.querySelectorAll('img');
              const imageSources = Array.from(imageElements)
                .map(img => img.src || img.getAttribute('srcset') || img.getAttribute('data-src'))
                .filter(src => src && src.trim() !== '')
                .slice(0, 20); // Limit to first 20 images
              return imageSources;
            }
          }, (results) => {
            if (results && results[0] && results[0].result) {
              setImages(results[0].result);
            }
          });
        }
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>NEXT-CHROME-STARTER</h1>
        {images.length > 0 && (
          <div style={{ fontSize: '11px', marginTop: '10px', maxHeight: '150px', overflowY: 'auto', textAlign: 'left', padding: '0 20px', width: '100%' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Images found ({images.length}):</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {images.map((imgSrc, index) => (
                <li key={index} style={{ marginBottom: '6px', wordBreak: 'break-all' }}>
                  {index + 1}. {imgSrc}
                </li>
              ))}
            </ul>
          </div>
        )}
        {images.length === 0 && (
          <p style={{ fontSize: '12px', marginTop: '10px', textAlign: 'center', padding: '0 20px' }}>
            No images found on this page
          </p>
        )}
        <p className={styles.description}>
          This is an example of a Browser Extension built with NEXT.JS.
          Please refer to the GitHub repo for running instructions and
          documentation
        </p>
          <h1 className={styles.code}>New Page ./components/New/index.js</h1>
          <p>{"[ - This is New page content - ]"}</p>
          <p onClick={() => navigateToPage('index')}>{"< Go Back"}</p>
        </main>
      </div>
    );
}
