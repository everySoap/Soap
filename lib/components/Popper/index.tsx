import PopperJS, { Data, Modifiers, Placement } from 'popper.js';
import React from 'react';
import ReactDOM from 'react-dom';
import NoSSR from 'react-no-ssr';
import styled from 'styled-components';

import { server } from '@lib/common/utils';

interface IChildProps {
  visible: boolean;
  close(): void;
}

type ContentFuncType = (props: IChildProps) => React.ReactNode;

type ContentType = React.ReactNode | ContentFuncType;

export interface IPopperProps {
  placement: Placement;
  visible: boolean;
  content: ContentType;
  transition?: boolean;
  getContainer?: Element;
  modifiers?: Modifiers;
  onClose(): void;
  onCreate?(data: Data): void;
  onUpdate?(data: Data): void;
}

export const PopperWrapper = styled.div`
  z-index: 1100;
`;

export function isIn(target: Node, parent: Element) {
  const path: Node[] = [];
  let parentNode: Node | null = target;
  while (parentNode && parentNode !== document.body) {
    path.push(parentNode);
    parentNode = parentNode.parentNode;
  }
  return path.indexOf(parent) !== -1;
}

export class Popper extends React.Component<IPopperProps> {

  public static getDerivedStateFromProps(nextProps: IPopperProps) {
    if (nextProps.visible) {
      return {
        exited: false,
      };
    }

    if (!nextProps.transition) {
      return {
        exited: true,
      };
    }

    return null;
  }
  public popperRef = React.createRef<HTMLDivElement>();
  public popper?: PopperJS;
  public state = {
    exited: !this.props.visible,
  };
  public componentWillUnmount() {
    this.handleClose();
  }
  public componentDidUpdate() {
    if (this.props.visible) {
      this.handleOpen();
    }
  }
  public ifEl = (e: MouseEvent) => {
    if (!this.props.visible) {
      return;
    }
    const referenceNode = ReactDOM.findDOMNode(this);
    if (!isIn(e.target as Node, this.popperRef.current!) && !isIn(e.target as Node, referenceNode as Element)) {
      if (this.props.onClose) this.props.onClose();
    }
  }
  public handleOpen = () => {
    if (this.popper) {
      this.handleClose();
    }
    document.addEventListener('mousedown', this.ifEl);
    const referenceNode = ReactDOM.findDOMNode(this) as Element;
    this.popper = new PopperJS(referenceNode, this.popperRef.current!, {
      placement: this.props.placement,
      modifiers: {
        preventOverflow: {
          boundariesElement: document.querySelector('body')!,
        },
        ...this.props.modifiers || {},
      },
      onCreate: this.props.onCreate,
      onUpdate: this.props.onUpdate,
    });
  }
  public handleClose = () => {
    document.removeEventListener('mousedown', this.ifEl);
    if (!this.popper) {
      return;
    }

    this.popper.destroy();
    this.popper = undefined;
  }
  public renderContent = () => {
    const { visible, content, transition } = this.props;
    const { exited } = this.state;
    const childProps: IChildProps = {
      visible,
      close: () => {
        this.handleClose();
        this.setState({
          exited: true,
        });
      },
    };
    if (!visible && (!transition || exited)) {
      return null;
    }
    return (
      <PopperWrapper ref={this.popperRef}>
        {typeof content === 'function' ? content(childProps) : content}
      </PopperWrapper>
    );
  }
  public render() {
    const { children } = this.props;
    return (
      <>
        {children}
        <NoSSR>
          {!server && ReactDOM.createPortal(
            this.renderContent(),
            this.props.getContainer || document.querySelector('#__next')!,
          )}
        </NoSSR>
      </>
    );
  }
}