import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="wp-dev-toolkit-page-header">
      <h1>Tailwind Test Component</h1>
      <p>This component demonstrates the wdt prefix in action</p>

      <div className="wdtmt-6 wdtgrid wdtgrid-cols-1 md:wdtgrid-cols-3 wdtgap-6">
        <div className="wdtbg-primary-500 wdttext-white wdtp-6 wdtrounded-lg wdtshadow-md">
          <h2 className="wdttext-xl wdtfont-bold wdtmb-2">Primary Color</h2>
          <p className="wdttext-primary-100">This uses our primary color palette</p>
          <button className="wdtmt-4 wdtbg-white wdttext-primary-600 wdtpx-4 wdtpy-2 wdtrounded wdtshadow hover:wdtbg-primary-50">Primary Button</button>
        </div>

        <div className="wdtbg-secondary-100 wdttext-secondary-800 wdtp-6 wdtrounded-lg wdtshadow-md">
          <h2 className="wdttext-xl wdtfont-bold wdtmb-2">Secondary Color</h2>
          <p className="wdttext-secondary-600">This uses our secondary color palette</p>
          <button className="wdtmt-4 wdtbg-secondary-500 wdttext-white wdtpx-4 wdtpy-2 wdtrounded wdtshadow hover:wdtbg-secondary-600">Secondary Button</button>
        </div>

        <div className="wdtbg-white wdtp-6 wdtrounded-lg wdtshadow-md wdtborder wdtborder-gray-200">
          <h2 className="wdttext-xl wdtfont-bold wdtmb-2">Status Colors</h2>
          <div className="wdtspace-y-2">
            <div className="wdtflex wdtitems-center wdtgap-2">
              <span className="wdtw-4 wdth-4 wdtrounded-full wdtbg-success-500"></span>
              <span className="wdttext-success-500 wdtfont-medium">Success</span>
            </div>
            <div className="wdtflex wdtitems-center wdtgap-2">
              <span className="wdtw-4 wdth-4 wdtrounded-full wdtbg-danger-500"></span>
              <span className="wdttext-danger-500 wdtfont-medium">Danger</span>
            </div>
            <div className="wdtflex wdtitems-center wdtgap-2">
              <span className="wdtw-4 wdth-4 wdtrounded-full wdtbg-warning-500"></span>
              <span className="wdttext-warning-500 wdtfont-medium">Warning</span>
            </div>
            <div className="wdtflex wdtitems-center wdtgap-2">
              <span className="wdtw-4 wdth-4 wdtrounded-full wdtbg-info-500"></span>
              <span className="wdttext-info-500 wdtfont-medium">Info</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wdtmt-8 wdtp-6 wdtbg-white wdtrounded-lg wdtshadow-md">
        <h2 className="wdttext-xl wdtfont-bold wdtmb-4">Tailwind Features with Prefix</h2>

        <div className="wdtspace-y-6">
          <div>
            <h3 className="wdttext-lg wdtfont-semibold wdtmb-2">Flexbox & Grid</h3>
            <div className="wdtflex wdtflex-wrap wdtgap-2 wdtmb-4">
              <div className="wdtbg-blue-100 wdtp-2 wdtrounded">Item 1</div>
              <div className="wdtbg-blue-100 wdtp-2 wdtrounded">Item 2</div>
              <div className="wdtbg-blue-100 wdtp-2 wdtrounded">Item 3</div>
            </div>
            <div className="wdtgrid wdtgrid-cols-4 wdtgap-2">
              <div className="wdtbg-green-100 wdtp-2 wdtrounded wdttext-center">1</div>
              <div className="wdtbg-green-100 wdtp-2 wdtrounded wdttext-center">2</div>
              <div className="wdtbg-green-100 wdtp-2 wdtrounded wdttext-center">3</div>
              <div className="wdtbg-green-100 wdtp-2 wdtrounded wdttext-center">4</div>
            </div>
          </div>

          <div>
            <h3 className="wdttext-lg wdtfont-semibold wdtmb-2">Spacing & Sizing</h3>
            <div className="wdtflex wdtitems-end wdtgap-2">
              <div className="wdth-4 wdtw-4 wdtbg-purple-300"></div>
              <div className="wdth-8 wdtw-8 wdtbg-purple-400"></div>
              <div className="wdth-12 wdtw-12 wdtbg-purple-500"></div>
              <div className="wdth-16 wdtw-16 wdtbg-purple-600"></div>
            </div>
          </div>

          <div>
            <h3 className="wdttext-lg wdtfont-semibold wdtmb-2">Typography</h3>
            <p className="wdttext-xs wdtmb-1">Extra Small Text</p>
            <p className="wdttext-sm wdtmb-1">Small Text</p>
            <p className="wdttext-base wdtmb-1">Base Text</p>
            <p className="wdttext-lg wdtmb-1">Large Text</p>
            <p className="wdttext-xl wdtmb-1">Extra Large Text</p>
            <p className="wdtfont-bold wdtmb-1">Bold Text</p>
            <p className="wdtitalic wdtmb-1">Italic Text</p>
            <p className="wdtfont-mono">Monospace Text</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
