import React, {cloneElement, type ReactElement} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {FONTS} from '@/constants';
import {useThemeStore} from '@/store/useThemeStore';

interface Option {
  label: string;
  icon: ReactElement;
  onSelect: () => void;
}

interface DropDownModalProps {
  isVisible: boolean;
  options: Option[];
  onClose: () => void;
  anchorPosition: {x: number; y: number};
}

const DropDownModal = ({
  isVisible,
  options,
  onClose,
  anchorPosition,
}: DropDownModalProps) => {
  const {theme} = useThemeStore();
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropColor="transparent"
      animationIn="fadeIn"
      animationOut="fadeOut"
      style={[
        styles.modal,
        {marginTop: anchorPosition.y + 4, marginLeft: anchorPosition.x - 156},
      ]}>
      <View style={styles.modalContent}>
        <View style={styles.dropdown}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                {
                  borderBottomWidth: index === options.length - 1 ? 0 : 1,
                  borderBottomColor: theme.TEXT200,
                },
              ]}
              onPress={option.onSelect}>
              {cloneElement(option.icon, {
                fill:
                  index === options.length - 1 ? theme.ERROR : theme.TEXT800,
              })}
              <Text
                style={[
                  FONTS.BODY2_REGULAR,
                  {
                    color:
                      index === options.length - 1
                        ? theme.ERROR
                        : theme.TEXT800,
                  },
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default DropDownModal;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    flex: 1,
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: 160,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
});