const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/features/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix types imports
  content = content.replace(/from '\.\.\/types'/g, "from '@/types'");
  content = content.replace(/from '\.\/types'/g, "from '@/types'");

  // Fix shared components imports
  content = content.replace(/from '\.\/StatCard'/g, "from '@/features/dashboard/components/StatCard'");
  content = content.replace(/from '\.\/LedgerTable'/g, "from '@/features/accounts/components/LedgerTable'");
  content = content.replace(/from '\.\/SiteVisitDrawer'/g, "from '@/features/site-visits/components/SiteVisitDrawer'");
  content = content.replace(/from '\.\/SiteVisitHistoryDrawer'/g, "from '@/features/site-visits/components/SiteVisitHistoryDrawer'");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed imports in ' + file);
  }
});
