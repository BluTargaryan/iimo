import type { Metadata } from "next";
import TopHeaderPreview from "@/app/components/sections/TopHeaderPreview";
import { createSupabaseServerClient } from "@/app/utils/supabase-server";

interface PreviewLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  props: PreviewLayoutProps
): Promise<Metadata> {
  const { params } = props;
  const resolvedParams = await params;
  const { id: shareToken } = resolvedParams;
  const supabase = createSupabaseServerClient();
  
  try {
    // Resolve share token to shoot_id
    const { data: shootId, error: tokenError } = await supabase.rpc('get_shoot_id_by_share_token', {
      token: shareToken,
    });

    if (tokenError || !shootId) {
      return {
        title: "Preview not found | iimo",
        description: "The requested preview link is invalid or has expired.",
      };
    }

    // Fetch shoot data for metadata
    const { data: shoot, error: shootError } = await supabase
      .from('shoots')
      .select(`
        title,
        shoot_date,
        clients (
          name
        )
      `)
      .eq('id', shootId)
      .single();

    if (shootError || !shoot) {
      return {
        title: "Preview not found | iimo",
        description: "The requested preview link is invalid or has expired.",
      };
    }

    const shootTitle = shoot.title || 'Untitled Shoot';
    const clientName = (shoot.clients as any)?.name || 'Unknown Client';
    const shootDate = shoot.shoot_date 
      ? new Date(shoot.shoot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;
    
    const description = shootDate 
      ? `Preview shoot "${shootTitle}" for ${clientName}, shot on ${shootDate}`
      : `Preview shoot "${shootTitle}" for ${clientName}`;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iimo.app';
    const previewUrl = `${baseUrl}/preview/${shareToken}`;

    // Fetch first asset for OG image (if available)
    let ogImage: string | undefined;
    const { data: firstAsset } = await supabase
      .from('assets')
      .select('image, watermarked_image')
      .eq('shoot_id', shootId)
      .limit(1)
      .single();
    
    if (firstAsset) {
      // Use watermarked image if available, otherwise regular image
      const imagePath = firstAsset.watermarked_image || firstAsset.image;
      if (imagePath) {
        const { data } = supabase.storage.from('assets').getPublicUrl(imagePath);
        ogImage = data.publicUrl;
      }
    }

    return {
      title: `${shootTitle} | iimo Preview`,
      description,
      openGraph: {
        title: shootTitle,
        description,
        type: 'website',
        url: previewUrl,
        siteName: 'iimo',
        ...(ogImage && { images: [{ url: ogImage, alt: shootTitle }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: shootTitle,
        description,
        ...(ogImage && { images: [ogImage] }),
      },
    };
  } catch (error) {
    return {
      title: "Preview | iimo",
      description: "View photo shoot preview on iimo",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='pt-40 pb-30 px-4 md:px-10'>
        <TopHeaderPreview />
        {children}
       
    </div>
  );
}
