import brandCitigram from '../assets/site/brand-citigram.svg';
import brandGric from '../assets/site/brand-gric.svg';
import brandGuo from '../assets/site/brand-guo.svg';
import brandLifetime from '../assets/site/brand-lifetime.svg';
import brandPalmeras from '../assets/site/brand-palmeras.svg';
import brandPapaya from '../assets/site/brand-papaya.svg';
import aniImage from '../assets/site/testimonial-ani.jpg';
import cristopherImage from '../assets/site/testimonial-cristopher.jpg';
import franklinImage from '../assets/site/testimonial-franklin.jpg';
import luisImage from '../assets/site/testimonial-luis.png';

export const brands = [
  { name: 'GRIC Bienes Raíces', logo: brandGric },
  { name: 'Las Palmeras del Sur', logo: brandPalmeras },
  { name: 'Marketing Papaya', logo: brandPapaya },
  { name: 'Citigram', logo: brandCitigram },
  { name: 'GUO', logo: brandGuo },
  { name: 'Lifetime Coffee', logo: brandLifetime },
];

export const testimonials = [
  {
    quote:
      'Diego es muy profesional, proactivo, ordenado pero sobre todo apasionado. Venimos trabajando un buen tiempo y ha sido una experiencia muy buena, porque vamos logrando los objetivos que nos proponemos.',
    name: 'Luis Pino',
    role: 'Cofundador de Citigram',
    image: luisImage,
    projectSlug: 'citigram-landing-pages',
  },
  {
    quote:
      'Diego demostró un alto nivel de profesionalismo y creatividad. Su habilidad para capturar exactamente lo que necesitaba y darle vida a mis ideas fue impresionante.',
    name: 'Ani Guevara',
    role: 'Fundadora de Marketing Papaya',
    image: aniImage,
    projectSlug: 'marketing-papaya-google-ads',
  },
  {
    quote:
      'Escuchó mis necesidades, se adaptó a Webflow y el resultado ha sido impresionante. Diego es muy organizado, sabe muy bien lo que hace, diseña y programa muy bien.',
    name: 'Cristopher Rivas',
    role: 'Agente inmobiliario en GRIC',
    image: cristopherImage,
    projectSlug: 'gric-bienes-raices',
  },
  {
    quote:
      'Escuchó mis necesidades y adaptó su trabajo a mis ideas. Creó un diseño y código de alta calidad y fue muy flexible con solicitudes adicionales.',
    name: 'Franklin Vargas',
    role: 'Gerente de Lifetime Coffee',
    image: franklinImage,
    projectSlug: 'lifetime-coffee',
  },
];
