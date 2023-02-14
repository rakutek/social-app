import React from 'react'
import {
  StyleSheet,
  StyleProp,
  View,
  ViewStyle,
  Image as RNImage,
} from 'react-native'
import {AppBskyEmbedImages, AppBskyEmbedExternal} from '@atproto/api'
import {Link} from '../Link'
import {Image} from '../images/Image'
import {ImageLayoutGrid} from '../images/ImageLayoutGrid'
import {ImagesLightbox} from '../../../../state/models/shell-ui'
import {useStores} from '../../../../state'
import {usePalette} from '../../../lib/hooks/usePalette'
import {saveImageModal} from '../../../../lib/images'
import YoutubeEmbed from './YoutubeEmbed'
import ExternalLinkEmbed from './ExternalLinkEmbed'
import {getYoutubeVideoId} from '../../../../lib/strings'

type Embed =
  | AppBskyEmbedImages.Presented
  | AppBskyEmbedExternal.Presented
  | {$type: string; [k: string]: unknown}

export function PostEmbeds({
  embed,
  style,
}: {
  embed?: Embed
  style?: StyleProp<ViewStyle>
}) {
  const pal = usePalette('default')
  const store = useStores()
  if (AppBskyEmbedImages.isPresented(embed)) {
    if (embed.images.length > 0) {
      const uris = embed.images.map(img => img.fullsize)
      const openLightbox = (index: number) => {
        store.shell.openLightbox(new ImagesLightbox(uris, index))
      }
      const onLongPress = (index: number) => {
        saveImageModal({uri: uris[index]})
      }
      const onPressIn = (index: number) => {
        const firstImageToShow = uris[index]
        RNImage.prefetch(firstImageToShow)
        uris.forEach(uri => {
          if (firstImageToShow !== uri) {
            // First image already prefeched above
            RNImage.prefetch(uri)
          }
        })
      }

      if (embed.images.length === 4) {
        return (
          <View style={[styles.imagesContainer, style]}>
            <ImageLayoutGrid
              type="four"
              uris={embed.images.map(img => img.thumb)}
              onPress={openLightbox}
              onLongPress={onLongPress}
              onPressIn={onPressIn}
            />
          </View>
        )
      } else if (embed.images.length === 3) {
        return (
          <View style={[styles.imagesContainer, style]}>
            <ImageLayoutGrid
              type="three"
              uris={embed.images.map(img => img.thumb)}
              onPress={openLightbox}
              onLongPress={onLongPress}
              onPressIn={onPressIn}
            />
          </View>
        )
      } else if (embed.images.length === 2) {
        return (
          <View style={[styles.imagesContainer, style]}>
            <ImageLayoutGrid
              type="two"
              uris={embed.images.map(img => img.thumb)}
              onPress={openLightbox}
              onLongPress={onLongPress}
              onPressIn={onPressIn}
            />
          </View>
        )
      } else {
        return (
          <View style={[styles.imagesContainer, style]}>
            <Image
              uri={embed.images[0].thumb}
              onPress={() => openLightbox(0)}
              onLongPress={() => onLongPress(0)}
              onPressIn={() => onPressIn(0)}
              style={styles.singleImage}
            />
          </View>
        )
      }
    }
  }
  if (AppBskyEmbedExternal.isPresented(embed)) {
    const link = embed.external
    const youtubeVideoId = getYoutubeVideoId(link.uri)

    if (youtubeVideoId) {
      return <YoutubeEmbed videoId={youtubeVideoId} link={link} />
    }

    return (
      <Link
        style={[styles.extOuter, pal.view, pal.border, style]}
        href={link.uri}
        noFeedback>
        <ExternalLinkEmbed link={link} />
      </Link>
    )
  }
  return <View />
}

const styles = StyleSheet.create({
  imagesContainer: {
    marginTop: 4,
  },
  singleImage: {
    borderRadius: 8,
    maxHeight: 500,
  },
  extOuter: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
})