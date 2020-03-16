import React, {
  CSSProperties, useRef, useCallback, memo,
} from 'react';
import { Transition } from 'react-spring/renderprops';
import { timingFunctions, rem } from 'polished';
import { Portal } from 'react-portal';

import {
  enableScroll, disableScroll,
} from '@lib/common/utils';
import { isFunction } from 'lodash';
import styled, { DefaultTheme } from 'styled-components';
import { useEnhancedEffect } from '@lib/common/hooks/useEnhancedEffect';
import { theme } from '@lib/common/utils/themes';
import {
  Box, Content, Mask, Wrapper, XIcon,
} from './styles';

export interface IModalProps {
  visible: boolean;
  onClose?: () => void;
  afterClose?: () => void;
  closeIcon?: boolean;
  theme?: DefaultTheme;
  fullscreen?: boolean;
  boxStyle?: React.CSSProperties;
  className?: string;
}

let _modalIndex = 0;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${rem(14)};
  border-bottom: 1px solid ${theme('colors.shadowColor')};
`;

export const Title = styled.h2`
  font-size: ${_ => rem(theme('fontSizes[3]')(_))};
`;

export const Modal: React.FC<IModalProps> = memo(({
  visible,
  afterClose,
  className,
  boxStyle,
  children,
  onClose,
  closeIcon = true,
  fullscreen = true,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDestroy = useRef<boolean>(visible);
  const shouldClose = useRef<boolean | null>(null);
  const isClose = useRef<boolean>(false);

  const setDestroy = useCallback((value: boolean) => isDestroy.current = value, []);
  const onDestroy = useCallback(() => {
    if (isDestroy.current) return;
    if (isFunction(afterClose)) {
      afterClose();
    }
    if (_modalIndex === 0) return;
    _modalIndex--;
    if (_modalIndex === 0) {
      enableScroll();
    }
    setDestroy(true);
  }, [afterClose, setDestroy]);
  const onEnter = useCallback(() => {
    _modalIndex++;
    disableScroll();
  }, []);
  const handleClose = useCallback(() => {
    if (isClose.current) return;
    isClose.current = true;
    if (isFunction(onClose)) {
      onClose();
    }
  }, [onClose]);
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (shouldClose.current === null) {
      shouldClose.current = true;
    }
    if (shouldClose.current && (e.target === contentRef.current || e.target === wrapperRef.current)) {
      handleClose();
    }
    shouldClose.current = null;
  }, [handleClose]);

  useEnhancedEffect(() => {
    if (visible) {
      isClose.current = false;
      setDestroy(false);
      onEnter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => () => onDestroy(), []);

  const handleContentOnMouseUp = useCallback(() => {
    shouldClose.current = null;
  }, []);
  // const handleContentOnClick = useCallback(() => {
  //   shouldClose.current = false;
  // }, []);
  const handleContentOnMouseDown = useCallback(() => {
    shouldClose.current = false;
  }, []);

  return (
    <Portal>
      <Transition
        items={visible}
        config={{
          duration: 200,
        }}
        from={{
          transform: 'scale3d(0.98, 0.98, 0.98)',
          opacity: 0,
        }}
        enter={{ opacity: 1, transform: 'scale3d(1, 1, 1)' }}
        leave={{
          opacity: 0,
          transform: 'scale3d(0.98, 0.98, 0.98)',
          pointerEvents: 'none',
        }}
        onRest={() => {
          if (!visible) {
            onDestroy();
          }
        }}
      >
        {
          (show: boolean) => show && ((styles: any) => (
            <div>
              <Mask
                style={{
                  transitionTimingFunction: timingFunctions('easeInOutSine'),
                  transition: '.2s all',
                  opacity: styles.opacity as any as number,
                  zIndex: 1000 + _modalIndex,
                }}
              />
              <Wrapper
                fullscreen={fullscreen ? 1 : 0}
                style={{ zIndex: 1000 + _modalIndex }}
                onClick={handleClick}
                ref={wrapperRef}
              >
                <Content ref={contentRef}>
                  <Box
                    style={{
                      transitionTimingFunction: timingFunctions('easeInOutSine'),
                      transition: '.2s all',
                      ...boxStyle || {},
                      ...styles as any,
                    }}
                    className={className}
                    onMouseDown={handleContentOnMouseDown}
                    onMouseUp={handleContentOnMouseUp}
                    onClick={handleContentOnMouseUp}
                  >
                    {
                      closeIcon && fullscreen
                      && <XIcon onClick={onClose} />
                    }
                    {children}
                  </Box>
                </Content>
              </Wrapper>
            </div>
          ))
        }
      </Transition>
    </Portal>
  );
});
