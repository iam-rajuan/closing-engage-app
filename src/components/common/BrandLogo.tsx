import { Image } from 'react-native';
import { SvgUri } from 'react-native-svg';

const logoAsset = require('../../../assets/branding/closing-engage-logo.svg');
const logoUri = Image.resolveAssetSource(logoAsset).uri;
const aspectRatio = 220 / 52;

type Props = {
  width?: number;
};

export function BrandLogo({ width = 128 }: Props) {
  return <SvgUri uri={logoUri} width={width} height={width / aspectRatio} />;
}
