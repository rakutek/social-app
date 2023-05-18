import React from 'react'
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {Text} from '../util/text/Text'
import {usePalette} from 'lib/hooks/usePalette'
import {s} from 'lib/styles'
import {UserAvatar} from '../util/UserAvatar'
import {observer} from 'mobx-react-lite'
import {CustomFeedModel} from 'state/models/feeds/custom-feed'
import {useNavigation} from '@react-navigation/native'
import {NavigationProp} from 'lib/routes/types'
import {useStores} from 'state/index'
import {pluralize} from 'lib/strings/helpers'
import {AtUri} from '@atproto/api'
import * as Toast from 'view/com/util/Toast'

export const CustomFeed = observer(
  ({
    item,
    style,
    showSaveBtn = false,
    showDescription = false,
    showLikes = false,
  }: {
    item: CustomFeedModel
    style?: StyleProp<ViewStyle>
    showSaveBtn?: boolean
    showDescription?: boolean
    showLikes?: boolean
  }) => {
    const store = useStores()
    const pal = usePalette('default')
    const navigation = useNavigation<NavigationProp>()

    const onToggleSaved = React.useCallback(() => {
      if (item.data.viewer?.saved) {
        store.shell.openModal({
          name: 'confirm',
          title: 'Remove from my feeds',
          message: `Remove ${item.displayName} from my feeds?`,
          onPressConfirm: () => {
            store.me.savedFeeds.unsave(item)
            Toast.show('Removed from my feeds')
          },
        })
      } else {
        store.me.savedFeeds.save(item)
        Toast.show('Added to my feeds')
      }
    }, [store, item])

    return (
      <TouchableOpacity
        accessibilityRole="button"
        style={[styles.container, pal.border, style]}
        onPress={() => {
          navigation.navigate('CustomFeed', {
            name: item.data.creator.did,
            rkey: new AtUri(item.data.uri).rkey,
          })
        }}
        key={item.data.uri}>
        <View style={[styles.headerContainer]}>
          <View style={[s.mr10]}>
            <UserAvatar type="algo" size={36} avatar={item.data.avatar} />
          </View>
          <View style={[styles.headerTextContainer]}>
            <Text style={[pal.text, s.bold]} numberOfLines={3}>
              {item.displayName}
            </Text>
            <Text style={[pal.textLight]} numberOfLines={3}>
              by @{item.data.creator.handle}
            </Text>
          </View>
          {showSaveBtn && (
            <View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  item.isSaved ? 'Remove from my feeds' : 'Add to my feeds'
                }
                accessibilityHint=""
                onPress={onToggleSaved}
                style={styles.btn}>
                {item.isSaved ? (
                  <FontAwesomeIcon
                    icon={['far', 'trash-can']}
                    size={19}
                    color={pal.colors.icon}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon="plus"
                    size={18}
                    color={pal.colors.link}
                  />
                )}
              </Pressable>
            </View>
          )}
        </View>

        {showDescription && item.data.description ? (
          <Text style={[pal.textLight, styles.description]} numberOfLines={3}>
            {item.data.description}
          </Text>
        ) : null}

        {showLikes ? (
          <Text type="sm-medium" style={[pal.text, pal.textLight]}>
            Liked by {item.data.likeCount || 0}{' '}
            {pluralize(item.data.likeCount || 0, 'user')}
          </Text>
        ) : null}
      </TouchableOpacity>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'column',
    flex: 1,
    borderTopWidth: 1,
    gap: 14,
  },
  headerContainer: {
    flexDirection: 'row',
  },
  headerTextContainer: {
    flexDirection: 'column',
    columnGap: 4,
    flex: 1,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
  },
  btn: {
    paddingVertical: 6,
  },
})