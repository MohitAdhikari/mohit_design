export const metadata = {
  title: 'PHONEOCEAN CMS Studio',
  description: 'Manage content for PHONEOCEAN',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
