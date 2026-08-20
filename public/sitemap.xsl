<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/"><html><head><title>Email Specification sitemap</title><style>body{font:16px system-ui;max-width:70rem;margin:3rem auto;padding:0 1rem}li{margin:.5rem 0}</style></head><body><h1>Email Specification sitemap</h1><ul><xsl:for-each select="s:urlset/s:url|s:sitemapindex/s:sitemap"><li><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></li></xsl:for-each></ul></body></html></xsl:template>
</xsl:stylesheet>
