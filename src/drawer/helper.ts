
type CommentNode = {
  shape: 'commentNode',
}

export function isCommentNode(cell: any): cell is CommentNode {
  return cell.shape === 'commentNode'
}

